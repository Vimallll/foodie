const express = require('express');
const {
    getAllChefApplications,
    updateChefStatus,
    getSuperAdminAnalytics,
    getChefDetails,
    getChefOrdersAdmin,
    manageChefPayout,
    deleteChefFood,
    getAllPendingPayouts,
    createHomeChef,
    deleteHomeChef
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and for Super Admin / Manager only
router.use(protect);
router.use(authorize('superAdmin', 'manager'));

router.get('/analytics', getSuperAdminAnalytics);
router.get('/chefs', getAllChefApplications);
router.get('/payouts', getAllPendingPayouts);
router.get('/chef/:id', getChefDetails);
router.get('/chef/:id/orders', getChefOrdersAdmin);
router.put('/chef/:id/status', updateChefStatus);
router.put('/chef/:id/payout/:payoutId', manageChefPayout);
router.delete('/food/:id', deleteChefFood);

// Create / Delete Home Chef (Admin)
router.post('/chef', createHomeChef);
router.delete('/chef/:id', deleteHomeChef);

module.exports = router;
