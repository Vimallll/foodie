const Food = require('../models/Food');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');

// @desc    Get restaurant admin's restaurant
// @route   GET /api/restaurant-admin/restaurant
// @access  Private/RestaurantAdmin
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurant)
      .populate('admin', 'name email');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurant's foods
// @route   GET /api/restaurant-admin/foods
// @access  Private/RestaurantAdmin
exports.getMyFoods = async (req, res) => {
  try {
    const foods = await Food.find({ restaurant: req.user.restaurant })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create food for restaurant
// @route   POST /api/restaurant-admin/foods
// @access  Private/RestaurantAdmin
exports.createFood = async (req, res) => {
  try {
    const { name, description, price, category, image, preparationTime } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const food = await Food.create({
      name,
      description,
      price,
      category,
      restaurant: req.user.restaurant,
      image: image || '',
      preparationTime: preparationTime || 20,
    });

    const populatedFood = await Food.findById(food._id)
      .populate('category', 'name')
      .populate('restaurant', 'name');

    res.status(201).json({
      success: true,
      food: populatedFood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food
// @route   PUT /api/restaurant-admin/foods/:id
// @access  Private/RestaurantAdmin
exports.updateFood = async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if food belongs to restaurant admin's restaurant
    if (food.restaurant.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this food' });
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name').populate('restaurant', 'name');

    res.json({
      success: true,
      food,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete food
// @route   DELETE /api/restaurant-admin/foods/:id
// @access  Private/RestaurantAdmin
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if food belongs to restaurant admin's restaurant
    if (food.restaurant.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this food' });
    }

    await food.deleteOne();

    res.json({
      success: true,
      message: 'Food deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurant's orders
// @route   GET /api/restaurant-admin/orders
// @access  Private/RestaurantAdmin
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.user.restaurant })
      .populate('user', 'name email phone')
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

// @desc    Update order status (Restaurant Admin can update to preparing/ready)
// @route   PUT /api/restaurant-admin/orders/:id/status
// @access  Private/RestaurantAdmin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to restaurant admin's restaurant
    if (order.restaurant.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Restaurant admin can only set status to preparing or ready
    if (!['preparing', 'ready', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status for restaurant admin' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
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

// @desc    Get restaurant stats
// @route   GET /api/restaurant-admin/stats
// @access  Private/RestaurantAdmin
exports.getStats = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const [totalFoods, totalOrders, pendingOrders, preparingOrders, readyOrders] = await Promise.all([
      Food.countDocuments({ restaurant: restaurantId }),
      Order.countDocuments({ restaurant: restaurantId }),
      Order.countDocuments({ restaurant: restaurantId, status: 'pending' }),
      Order.countDocuments({ restaurant: restaurantId, status: 'preparing' }),
      Order.countDocuments({ restaurant: restaurantId, status: 'ready' }),
    ]);

    // Calculate total revenue
    const orders = await Order.find({ 
      restaurant: restaurantId, 
      status: 'delivered' 
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      success: true,
      stats: {
        totalFoods,
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

