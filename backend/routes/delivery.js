const express = require('express');
const router = express.Router();
const {
  getAvailableOrders,
  getMyOrders,
  acceptOrder,
  deliverOrder,
  updateAvailability,
  getStats,
} = require('../controllers/deliveryController');
const { protect, delivery } = require('../middleware/auth');

// Orders
router.get('/orders/available', protect, delivery, getAvailableOrders);
router.get('/orders', protect, delivery, getMyOrders);
router.post('/orders/:id/accept', protect, delivery, acceptOrder);
router.put('/orders/:id/deliver', protect, delivery, deliverOrder);

// Availability
router.put('/availability', protect, delivery, updateAvailability);

// Stats
router.get('/stats', protect, delivery, getStats);

module.exports = router;

