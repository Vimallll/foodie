const express = require('express');
const router = express.Router();
const {
  getMyRestaurant,
  getMyFoods,
  createFood,
  updateFood,
  deleteFood,
  getMyOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  getStats,
} = require('../controllers/restaurantAdminController');
const { protect, admin, orderAdmin } = require('../middleware/auth');

// Restaurant info (Admin can access all restaurants)
router.get('/restaurant', protect, admin, getMyRestaurant);
router.get('/restaurant/:id', protect, admin, getMyRestaurant);

// Foods (Admin can manage all foods)
router.get('/foods', protect, admin, getMyFoods);
router.post('/foods', protect, admin, createFood);
router.put('/foods/:id', protect, admin, updateFood);
router.delete('/foods/:id', protect, admin, deleteFood);

// Orders (Admin can manage all orders from all restaurants)
router.get('/orders', protect, orderAdmin, getMyOrders);
router.post('/orders/:id/accept', protect, orderAdmin, acceptOrder);
router.post('/orders/:id/reject', protect, orderAdmin, rejectOrder);
router.put('/orders/:id/status', protect, orderAdmin, updateOrderStatus);

// Stats (Admin can see all stats)
router.get('/stats', protect, admin, getStats);

module.exports = router;

