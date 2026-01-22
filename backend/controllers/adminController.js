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
    const totalUsers = await User.countDocuments({ role: { $ne: 'delivery' } });
    const totalDeliveryPartners = await User.countDocuments({ role: 'delivery' });
    const totalFoods = await Food.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();

    const pendingOrders = await Order.countDocuments({ status: 'PLACED' });
    const preparingOrders = await Order.countDocuments({ status: 'PREPARING' });
    const deliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDeliveryPartners,
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

// @desc    Get all delivery partners
// @route   GET /api/admin/delivery-partners
// @access  Private/Admin
exports.getDeliveryPartners = async (req, res) => {
  try {
    const deliveryPartners = await User.find({ role: 'delivery' })
      .select('-password -phoneOtp -phoneOtpExpiry -emailVerificationToken -emailVerificationExpiry')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deliveryPartners.length,
      deliveryPartners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery partner status (verify, activate, etc.)
// @route   PUT /api/admin/delivery-partners/:id
// @access  Private/Admin
exports.updateDeliveryPartner = async (req, res) => {
  try {
    const { isVerified, isActive } = req.body;
    const updateData = {};

    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isActive !== undefined) updateData.isActive = isActive;

    const deliveryPartner = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -phoneOtp -phoneOtpExpiry -emailVerificationToken -emailVerificationExpiry');

    if (!deliveryPartner || deliveryPartner.role !== 'delivery') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    res.json({
      success: true,
      deliveryPartner,
      message: 'Delivery partner updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
