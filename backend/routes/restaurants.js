const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  assignManager,
} = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, admin, createRestaurant);
router.put('/:id', protect, admin, updateRestaurant);
router.delete('/:id', protect, admin, deleteRestaurant);
router.post('/:id/assign-manager', protect, admin, assignManager);

module.exports = router;

