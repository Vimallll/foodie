const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Manager only (Manager = Admin functionality)
exports.admin = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'superAdmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Manager only.' });
  }
};

// Super Admin only
exports.superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super admin only.' });
  }
};

// Order management - Manager/SuperAdmin can manage all orders
exports.orderAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Re-fetch user from database to ensure we have the latest role
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Update req.user with latest data
    req.user = user;

    if (user.role === 'manager' || user.role === 'superAdmin') {
      next();
    } else {
      console.error('OrderAdmin middleware: User role mismatch', {
        userId: user._id,
        role: user.role,
        expected: 'manager or superAdmin',
        email: user.email
      });
      return res.status(403).json({
        message: 'Access denied. Manager only.',
        debug: process.env.NODE_ENV === 'development' ? { userId: user._id, role: user.role } : undefined
      });
    }
  } catch (error) {
    console.error('OrderAdmin middleware error:', error);
    return res.status(500).json({ message: 'Error verifying user role' });
  }
};

// Delivery person only
exports.delivery = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Re-fetch user from database to ensure we have the latest role
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      console.error('Delivery middleware: User not found in database', { userId });
      return res.status(401).json({ message: 'User not found' });
    }

    // Update req.user with latest data
    req.user = user;

    if (user.role !== 'delivery') {
      console.error('Delivery middleware: User role mismatch', {
        userId: user._id,
        actualRole: user.role,
        expectedRole: 'delivery',
        email: user.email,
        phone: user.phone || user.phoneNumber
      });
      return res.status(403).json({
        message: `Access denied. Delivery person only. Your current role is: ${user.role}`,
        debug: process.env.NODE_ENV === 'development' ? {
          userId: user._id,
          actualRole: user.role,
          expectedRole: 'delivery'
        } : undefined
      });
    }

    next();
  } catch (error) {
    console.error('Delivery middleware error:', error);
    return res.status(500).json({ message: 'Error verifying user role' });
  }
};

// Delivery partner verified middleware
exports.deliveryVerified = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access denied. Delivery partner only.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Account not verified. Please wait for admin approval.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying delivery partner' });
  }
};
