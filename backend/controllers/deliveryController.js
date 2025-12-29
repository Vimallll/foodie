const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get available orders (ready for delivery)
// @route   GET /api/delivery/orders/available
// @access  Private/Delivery
exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: 'ready',
      deliveryPerson: null 
    })
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
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

// @desc    Get delivery person's assigned orders
// @route   GET /api/delivery/orders
// @access  Private/Delivery
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPerson: req.user.id })
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
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

// @desc    Accept/Assign order to delivery person
// @route   POST /api/delivery/orders/:id/accept
// @access  Private/Delivery
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({ message: 'Order is not ready for delivery' });
    }

    if (order.deliveryPerson) {
      return res.status(400).json({ message: 'Order is already assigned to a delivery person' });
    }

    // Check if delivery person is available
    if (!req.user.isAvailable) {
      return res.status(400).json({ message: 'You are not available for delivery' });
    }

    order.deliveryPerson = req.user.id;
    order.status = 'out_for_delivery';
    order.updatedAt = Date.now();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status to delivered
// @route   PUT /api/delivery/orders/:id/deliver
// @access  Private/Delivery
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is assigned to this delivery person
    if (order.deliveryPerson.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to deliver this order' });
    }

    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({ message: 'Order is not out for delivery' });
    }

    order.status = 'delivered';
    order.updatedAt = Date.now();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery person availability
// @route   PUT /api/delivery/availability
// @access  Private/Delivery
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const user = await User.findById(req.user.id);
    user.isAvailable = isAvailable;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery person stats
// @route   GET /api/delivery/stats
// @access  Private/Delivery
exports.getStats = async (req, res) => {
  try {
    const [totalOrders, deliveredOrders, inProgressOrders] = await Promise.all([
      Order.countDocuments({ deliveryPerson: req.user.id }),
      Order.countDocuments({ deliveryPerson: req.user.id, status: 'delivered' }),
      Order.countDocuments({ 
        deliveryPerson: req.user.id, 
        status: 'out_for_delivery' 
      }),
    ]);

    // Calculate total earnings (assuming delivery fee is $2 per order)
    const deliveryFee = 2;
    const totalEarnings = deliveredOrders * deliveryFee;

    res.json({
      success: true,
      stats: {
        totalOrders,
        deliveredOrders,
        inProgressOrders,
        totalEarnings,
        isAvailable: req.user.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

