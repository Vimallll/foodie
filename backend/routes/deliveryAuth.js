const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  verifyOTP,
  verifyEmail,
  resendOTP,
  resendEmailVerification,
} = require('../controllers/deliveryAuthController');
const { protect, delivery } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/resend-email-verification', resendEmailVerification);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, delivery, logout);
router.get('/me', protect, delivery, getMe);
router.put('/profile', protect, delivery, updateProfile);

module.exports = router;

