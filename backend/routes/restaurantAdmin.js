const express = require('express');
const router = express.Router();
const {
  getMyRestaurant,
  getMyFoods,
  createFood,
  updateFood,
  deleteFood,
  getMyOrders,
  updateOrderStatus,
  getStats,
} = require('../controllers/restaurantAdminController');
const { protect, restaurantAdmin } = require('../middleware/auth');

// Restaurant info
router.get('/restaurant', protect, restaurantAdmin, getMyRestaurant);

// Foods
router.get('/foods', protect, restaurantAdmin, getMyFoods);
router.post('/foods', protect, restaurantAdmin, createFood);
router.put('/foods/:id', protect, restaurantAdmin, updateFood);
router.delete('/foods/:id', protect, restaurantAdmin, deleteFood);

// Orders
router.get('/orders', protect, restaurantAdmin, getMyOrders);
router.put('/orders/:id/status', protect, restaurantAdmin, updateOrderStatus);

// Stats
router.get('/stats', protect, restaurantAdmin, getStats);

module.exports = router;

