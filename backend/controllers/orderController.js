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
      homeChef: ['PREPARING', 'CANCELLED'],
    },
    ACCEPTED: {
      manager: ['PREPARING', 'CANCELLED'],
      superAdmin: ['PREPARING', 'CANCELLED'],
    },
    PREPARING: {
      manager: ['READY_FOR_PICKUP', 'CANCELLED'],
      superAdmin: ['READY_FOR_PICKUP', 'CANCELLED'],
      homeChef: ['READY', 'CANCELLED'],
    },
    READY_FOR_PICKUP: {
      delivery: ['OUT_FOR_DELIVERY'],
      manager: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      superAdmin: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    },
    READY: {
      homeChef: ['DELIVERED', 'CANCELLED'],
      delivery: ['OUT_FOR_DELIVERY'],
      superAdmin: ['DELIVERED', 'CANCELLED'],
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

    // --- SPLIT ORDER LOGIC ---
    // Group items by "source" (either Restaurant ID or Chef ID)
    const orderGroups = {};

    for (const item of cart.items) {
      const food = item.food;

      // Identify source
      let sourceKey;
      let sourceType; // 'restaurant' or 'chef'
      let sourceId;

      if (food.foodType === 'home' && food.chef) {
        sourceType = 'chef';
        sourceId = food.chef.toString();
        sourceKey = `chef_${sourceId}`;
      } else if (food.restaurant) {
        sourceType = 'restaurant';
        sourceId = food.restaurant.toString();
        sourceKey = `restaurant_${sourceId}`;
      } else {
        console.warn(`Food item ${food._id} has no valid source (restaurant/chef). Skipping.`);
        continue;
      }

      if (!orderGroups[sourceKey]) {
        orderGroups[sourceKey] = {
          sourceType,
          sourceId,
          items: [],
          totalAmount: 0,
          maxPreparationTime: 0
        };
      }

      // Add item to group
      orderGroups[sourceKey].items.push({
        food: food._id,
        name: food.name,
        quantity: item.quantity,
        price: item.price
      });

      // Update group total
      orderGroups[sourceKey].totalAmount += (item.price * item.quantity);

      // Update max prep time
      const prepTime = food.preparationTime || 20;
      if (prepTime > orderGroups[sourceKey].maxPreparationTime) {
        orderGroups[sourceKey].maxPreparationTime = prepTime;
      }
    }

    const createdOrders = [];

    // Process each group and create an Order
    for (const key in orderGroups) {
      const group = orderGroups[key];

      // Calculate estimated delivery
      const estimatedDeliveryTime = group.maxPreparationTime + 30; // 30 mins delivery buffer

      const orderData = {
        user: req.user.id,
        items: group.items,
        deliveryAddress,
        totalAmount: group.totalAmount,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: paymentMethod && paymentMethod !== 'cash' ? 'pending' : 'paid',
        status: 'PLACED',
        estimatedPreparationTime: group.maxPreparationTime,
        estimatedDeliveryTime: estimatedDeliveryTime,
        deliveryPerson: null
      };

      if (group.sourceType === 'restaurant') {
        orderData.restaurant = group.sourceId;
      } else if (group.sourceType === 'chef') {
        orderData.chef = group.sourceId;
      }

      const order = await Order.create(orderData);
      createdOrders.push(order);

      // -- NOTIFICATIONS --

      // Notify User
      await createNotification(
        req.user.id,
        order._id,
        'Order Placed',
        `Order #${order._id.toString().slice(-6)} placed successfully`,
        'order_placed'
      );

      // Notify Source (Restaurant Admin or Home Chef)
      if (group.sourceType === 'restaurant') {
        const Restaurant = require('../models/Restaurant');
        const restaurant = await Restaurant.findById(group.sourceId).populate('admin');
        if (restaurant && restaurant.admin) {
          await createNotification(
            restaurant.admin._id,
            order._id,
            'New Order',
            `New Order #${order._id.toString().slice(-6)} received`,
            'order_placed'
          );
        }
      } else if (group.sourceType === 'chef') {
        // Notify Home Chef (who is a User)
        await createNotification(
          group.sourceId,
          order._id,
          'New Home Kitchen Order',
          `You have a new order #${order._id.toString().slice(-6)}!`,
          'order_placed'
        );
      }

      // Emit Socket Event
      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('restaurant', 'name')
        .populate('chef', 'name chefProfile') // Populate chef info if exists
        .populate('items.food');

      socketHelper.emitOrderUpdate(populatedOrder, 'new-order');
    }

    // Clear cart after processing all groups
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      count: createdOrders.length,
      orders: createdOrders,
      message: createdOrders.length > 1
        ? `Split into ${createdOrders.length} orders based on different kitchens`
        : 'Order placed successfully',
    });

  } catch (error) {
    console.error('Create Order Error:', error);
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

// @desc    Get chef orders
// @route   GET /api/orders/chef-orders
// @access  Private (HomeChef)
exports.getChefOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { chef: req.user.id };

    if (status) {
      if (status === 'active') {
        query.status = { $in: ['PLACED', 'PREPARING', 'READY'] };
      } else if (status === 'history') {
        query.status = { $in: ['DELIVERED', 'CANCELLED', 'REJECTED'] };
      } else {
        query.status = status;
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
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
    let userRole;
    if (req.user.role === 'superAdmin') {
      userRole = 'superAdmin';
    } else if (req.user.role === 'homeChef') {
      userRole = 'homeChef';
      // Verify chef owns this order
      if (!order.chef || order.chef.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
    } else if (req.user.role === 'delivery') {
      userRole = 'delivery';
    } else if (req.user.role === 'manager') {
      userRole = 'manager';
    } else {
      userRole = 'admin';
    }
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
