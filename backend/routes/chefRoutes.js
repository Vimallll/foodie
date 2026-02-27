const express = require('express');
const { registerChef, getChefs, getChefById, updateChefProfile, getChefDashboardWrapper, getChefEarnings, requestPayout } = require('../controllers/chefController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', protect, registerChef);
router.get('/dashboard/stats', protect, authorize('homeChef'), getChefDashboardWrapper);
router.get('/earnings', protect, authorize('homeChef'), getChefEarnings);
router.post('/payout', protect, authorize('homeChef'), requestPayout);
router.put('/profile', protect, authorize('homeChef'), updateChefProfile);
router.get('/', getChefs);
router.get('/:id', getChefById);

module.exports = router;
