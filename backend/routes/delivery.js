const express = require('express');
const router = express.Router();
const {
  getNewOrders,
  getMyOrders,
  acceptOrder,
  rejectOrder,
  deliverOrder,
  updateOrderStatus,
  updateAvailability,
  updateStatus,
  updateLocation,
  getStats,
  getDashboard,
  getEarnings,
  getHistory,
} = require('../controllers/deliveryController');
const { protect, delivery, deliveryVerified } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', protect, delivery, getDashboard);

// Orders
router.get('/orders/new', protect, delivery, deliveryVerified, getNewOrders);
router.get('/orders', protect, delivery, getMyOrders);
router.post('/orders/:id/accept', protect, delivery, deliveryVerified, acceptOrder);
router.post('/orders/:id/reject', protect, delivery, rejectOrder);
router.put('/orders/:id/deliver', protect, delivery, deliverOrder);
router.patch('/orders/:id/status', protect, delivery, updateOrderStatus);

// Status & Location
router.patch('/status', protect, delivery, updateStatus);
router.put('/availability', protect, delivery, updateAvailability); // Keep for backward compatibility
router.post('/location', protect, delivery, updateLocation); // Update live location

// Earnings & History
router.get('/earnings', protect, delivery, getEarnings);
router.get('/history', protect, delivery, getHistory);

// Stats
router.get('/stats', protect, delivery, getStats);

module.exports = router;

