const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFoods = await Food.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();

    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const preparingOrders = await Order.countDocuments({ status: 'preparing' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFoods,
        totalOrders,
        totalCategories,
        totalRestaurants,
        orders: {
          pending: pendingOrders,
          preparing: preparingOrders,
          delivered: deliveredOrders,
        },
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

