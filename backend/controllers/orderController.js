const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

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

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      deliveryAddress,
      totalAmount: cart.total,
      paymentMethod: paymentMethod || 'cash',
      restaurant: restaurantId,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.food');

    res.status(201).json({
      success: true,
      order: populatedOrder,
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
    const order = await Order.findById(req.params.id).populate('items.food');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order, is admin, restaurant admin, or delivery person
    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isRestaurantAdmin = req.user.role === 'restaurant_admin' && 
      order.restaurant && order.restaurant.toString() === req.user.restaurant?.toString();
    const isDeliveryPerson = req.user.role === 'delivery' && 
      order.deliveryPerson && order.deliveryPerson.toString() === req.user.id.toString();

    if (!isOwner && !isAdmin && !isRestaurantAdmin && !isDeliveryPerson) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('deliveryPerson', 'name email')
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.food');

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
