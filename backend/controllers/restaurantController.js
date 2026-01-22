const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to optionally get user from token
const getOptionalUser = async (req) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token || !process.env.JWT_SECRET) {
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    return null;
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public (Admin gets populated admin field)
exports.getRestaurants = async (req, res) => {
  try {
    let query = { isActive: true };
    
    // Try to get user from token (optional authentication)
    const user = req.user || await getOptionalUser(req);
    
    // For admin (check if authenticated and admin), include inactive restaurants and populate admin
    if (user && (user.role === 'superAdmin' || user.role === 'manager')) {
      query = {};
      const restaurants = await Restaurant.find(query)
        .populate({
          path: 'admin',
          select: 'name email role',
        })
        .lean()
        .sort({ name: 1 });
      
      return res.json({
        success: true,
        count: restaurants.length,
        restaurants,
      });
    }
    
    const restaurants = await Restaurant.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

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

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await restaurant.deleteOne();

    res.json({
      success: true,
      message: 'Restaurant deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign manager to restaurant
// @route   POST /api/restaurants/:id/assign-manager
// @access  Private/Admin
exports.assignManager = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is already assigned to this restaurant, return success
    if (restaurant.admin && restaurant.admin.toString() === user._id.toString()) {
      await restaurant.populate('admin', 'name email');
      return res.json({
        success: true,
        message: `${user.name} is already the manager of ${restaurant.name}`,
        restaurant,
      });
    }

    // Remove previous manager assignment if exists (if restaurant has a different admin)
    if (restaurant.admin && restaurant.admin.toString() !== user._id.toString()) {
      const previousManager = await User.findById(restaurant.admin);
      if (previousManager) {
        previousManager.restaurant = null;
        await previousManager.save();
      }
    }

    // If user is already a manager of another restaurant, unassign them from that restaurant
    if (user.restaurant && user.restaurant.toString() !== restaurant._id.toString()) {
      const previousRestaurant = await Restaurant.findById(user.restaurant);
      if (previousRestaurant) {
        previousRestaurant.admin = null;
        await previousRestaurant.save();
      }
    }

    // Update user to manager role and assign restaurant
    // Use findByIdAndUpdate to properly unset delivery-specific fields
    const updateData = {
      role: 'manager',
      restaurant: restaurant._id,
    };

    // Only unset delivery-specific fields if user was previously a delivery partner
    if (user.role === 'delivery') {
      updateData.$unset = {
        vehicleType: '',
        vehicleNumber: '',
        drivingLicenseNumber: '',
        profilePhoto: '',
        phoneOtp: '',
        phoneOtpExpiry: '',
        emailVerificationToken: '',
        emailVerificationExpiry: '',
        status: '',
        availabilityStatus: '',
        isAvailable: '',
      };
      // Set phone to empty string since it's no longer required for manager role
      updateData.phone = '';
      updateData.phoneNumber = '';
    }

    // Use findByIdAndUpdate with separate operations if needed
    let updatedUser;
    if (user.role === 'delivery') {
      // For delivery partners, use $unset to remove delivery fields
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            role: 'manager',
            restaurant: restaurant._id,
            phone: '',
            phoneNumber: '',
          },
          $unset: updateData.$unset,
        },
        { new: true, runValidators: false }
      );
    } else {
      // For regular users, simple update
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: false }
      );
    }

    // Verify the update was successful
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update user' });
    }

    // Update restaurant with new admin
    restaurant.admin = user._id;
    await restaurant.save();

    // Populate admin field for response
    await restaurant.populate('admin', 'name email');

    res.json({
      success: true,
      message: `Manager assigned successfully to ${restaurant.name}`,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

