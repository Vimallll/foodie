const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userObj = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    };

    // Include restaurant if user is restaurant admin
    if (user.role === 'restaurant_admin' && user.restaurant) {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findById(user.restaurant);
      userObj.restaurant = restaurant;
    }

    // Include availability if user is delivery person
    if (user.role === 'delivery') {
      userObj.isAvailable = user.isAvailable;
    }

    res.json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, isAvailable } = req.body;

    const updateData = { name, phone, address };
    if (req.user.role === 'delivery' && isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    const userObj = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    };

    // Include restaurant if user is restaurant admin
    if (user.role === 'restaurant_admin' && user.restaurant) {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findById(user.restaurant);
      userObj.restaurant = restaurant;
    }

    // Include availability if user is delivery person
    if (user.role === 'delivery') {
      userObj.isAvailable = user.isAvailable;
    }

    res.json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
