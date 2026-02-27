const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect, admin, authorize, checkChefStatus } = require('../middleware/auth');

router.get('/', getFoods);
router.get('/:id', getFood);
router.post('/', protect, authorize('superAdmin', 'manager', 'homeChef'), checkChefStatus, createFood);
router.put('/:id', protect, authorize('superAdmin', 'manager', 'homeChef'), checkChefStatus, updateFood);
router.delete('/:id', protect, authorize('superAdmin', 'manager', 'homeChef'), checkChefStatus, deleteFood);

module.exports = router;

