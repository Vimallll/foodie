const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Notification = require('../models/Notification');
const socketHelper = require('../utils/socket');

// Helper function to create notification
const createNotification = async (userId, orderId, title, message, type) => {
  try {
    await Notification.create({
      user: userId,
      order: orderId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Helper function to validate status transitions
const isValidStatusTransition = (currentStatus, newStatus, role) => {
  const validTransitions = {
    PLACED: {
      manager: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
      superAdmin: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    },
    ACCEPTED: {
      manager: ['PREPARING', 'CANCELLED'],
      superAdmin: ['PREPARING', 'CANCELLED'],
    },
    PREPARING: {
      manager: ['READY_FOR_PICKUP', 'CANCELLED'],
      superAdmin: ['READY_FOR_PICKUP', 'CANCELLED'],
    },
    READY_FOR_PICKUP: {
      delivery: ['OUT_FOR_DELIVERY'],
      manager: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      superAdmin: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    },
    OUT_FOR_DELIVERY: {
      delivery: ['DELIVERED'],
      manager: ['DELIVERED', 'CANCELLED'],
      superAdmin: ['DELIVERED', 'CANCELLED'],
    },
    REJECTED: {
      admin: ['CANCELLED'],
      superAdmin: ['CANCELLED'],
    },
    DELIVERED: {}, // Terminal state
    CANCELLED: {}, // Terminal state
  };

  if (!validTransitions[currentStatus]) return false;
  if (Object.keys(validTransitions[currentStatus]).length === 0) return false;

  const roleTransitions = validTransitions[currentStatus][role] || validTransitions[currentStatus]['admin'] || [];
  return roleTransitions.includes(newStatus);
};

// @desc    Create order (Place order)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.food');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare order items and get restaurant from first food item
    const orderItems = cart.items.map((item) => ({
      food: item.food._id,
      name: item.food.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // Get restaurant from the first food item (assuming all items are from same restaurant)
    const firstFood = await Food.findById(cart.items[0].food._id);
    const restaurantId = firstFood ? firstFood.restaurant : null;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Unable to determine restaurant' });
    }

    // Calculate estimated times
    // Get max preparation time from all food items
    const maxPreparationTime = Math.max(
      ...cart.items.map(item => item.food.preparationTime || 20),
      20 // Default 20 minutes
    );
    
    // Calculate estimated delivery time (preparation + delivery)
    // Default delivery time: 15-20 minutes based on distance
    const estimatedDeliveryTime = maxPreparationTime + 15; // Add 15 min for delivery

    // Create order with status PLACED
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      deliveryAddress,
      totalAmount: cart.total,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod && paymentMethod !== 'cash' ? 'pending' : 'paid',
      restaurant: restaurantId,
      status: 'PLACED',
      deliveryPerson: null,
      estimatedPreparationTime: maxPreparationTime,
      estimatedDeliveryTime: estimatedDeliveryTime,
    });

    // Clear cart
    cart.items = [];
    cart.total = 0;
    await cart.save();

    // Create notification for restaurant admin
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(restaurantId).populate('admin');
    if (restaurant && restaurant.admin) {
      await createNotification(
        restaurant.admin._id,
        order._id,
        'New Order Placed',
        `Order #${order._id.toString().slice(-6)} has been placed`,
        'order_placed'
      );
    }

    // Create notification for user
    await createNotification(
      req.user.id,
      order._id,
      'Order Placed',
      'Your order has been placed successfully',
      'order_placed'
    );

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin')
      .populate('items.food');

    // Emit real-time update
    socketHelper.emitOrderUpdate(populatedOrder, 'new-order');

    res.status(201).json({
      success: true,
      order: populatedOrder,
      message: 'Order placed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.food')
      .populate('restaurant', 'name')
      .populate('deliveryPerson', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.food')
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('deliveryPerson', 'name fullName email phone phoneNumber');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order, is manager (of that restaurant), superAdmin, or delivery person
    const isOwner = order.user._id.toString() === req.user.id.toString();
    
    // Manager can only view orders from their restaurant
    let isManager = false;
    if (req.user.role === 'manager' && req.user.restaurant) {
      const userRestaurantId = req.user.restaurant._id ? req.user.restaurant._id.toString() : req.user.restaurant.toString();
      const orderRestaurantId = order.restaurant._id ? order.restaurant._id.toString() : order.restaurant.toString();
      isManager = userRestaurantId === orderRestaurantId;
    }
    
    const isSuperAdmin = req.user.role === 'superAdmin';
    const isDeliveryPerson = req.user.role === 'delivery' && 
      order.deliveryPerson && order.deliveryPerson._id.toString() === req.user.id.toString();

    if (!isOwner && !isManager && !isSuperAdmin && !isDeliveryPerson) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Super Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, restaurant, deliveryPerson } = req.query;
    const query = {};

    if (status) query.status = status;
    if (restaurant) query.restaurant = restaurant;
    if (deliveryPerson) query.deliveryPerson = deliveryPerson;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin/Super Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const userRole = req.user.role === 'superAdmin' ? 'superAdmin' : 'admin';
    if (!isValidStatusTransition(order.status, status, userRole)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = Date.now();

    // Handle special cases
    if (status === 'DELIVERED' && order.deliveryPerson) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(order.deliveryPerson, { 
        status: 'AVAILABLE',
        isAvailable: true 
      });
    }

    await order.save();

    // Create notifications
    let notificationType = 'general';
    let title = 'Order Status Updated';
    let message = `Your order status has been updated to ${status}`;

    switch (status) {
      case 'DELIVERED':
        notificationType = 'order_delivered';
        title = 'Order Delivered';
        message = 'Your order has been delivered successfully!';
        break;
      case 'CANCELLED':
        notificationType = 'order_cancelled';
        title = 'Order Cancelled';
        message = reason || 'Your order has been cancelled';
        break;
    }

    // Notify user
    await createNotification(order.user._id, order._id, title, message, notificationType);

    // Notify restaurant admin if status changed
    if (order.restaurant && order.restaurant.admin) {
      await createNotification(
        order.restaurant.admin._id,
        order._id,
        `Order ${status}`,
        `Order #${order._id.toString().slice(-6)} is now ${status}`,
        notificationType
      );
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-updated');

    res.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated from ${oldStatus} to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation if order is PLACED (before restaurant accepts)
    // Like Zomato/Swiggy - users can only cancel before restaurant accepts
    if (order.status !== 'PLACED') {
      return res.status(400).json({ 
        message: `Cannot cancel order. Order can only be cancelled before restaurant accepts it. Current status: ${order.status}` 
      });
    }

    // Check if order was placed more than 5 minutes ago (optional time limit)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (order.createdAt < fiveMinutesAgo) {
      return res.status(400).json({ 
        message: 'Cancellation time limit exceeded. Please contact support to cancel this order.' 
      });
    }

    const oldStatus = order.status;
    order.status = 'CANCELLED';
    order.cancelledAt = Date.now();
    order.cancellationReason = reason || 'Cancelled by user';
    order.updatedAt = Date.now();
    await order.save();

    // If delivery person was assigned, mark them as available
    if (order.deliveryPerson) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(order.deliveryPerson, { 
        status: 'AVAILABLE',
        isAvailable: true 
      });
    }

    // Create notifications
    await createNotification(
      order.user._id,
      order._id,
      'Order Cancelled',
      reason || 'Your order has been cancelled',
      'order_cancelled'
    );

    if (order.restaurant && order.restaurant.admin) {
      await createNotification(
        order.restaurant.admin._id,
        order._id,
        'Order Cancelled',
        `Order #${order._id.toString().slice(-6)} has been cancelled by customer`,
        'order_cancelled'
      );
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-cancelled');

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
