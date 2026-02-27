const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getChefOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/chef-orders', protect, getChefOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus); // Removed admin-only: chefs also update status
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;

