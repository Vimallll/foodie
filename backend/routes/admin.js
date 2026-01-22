const express = require('express');
const router = express.Router();
const { getStats, getDeliveryPartners, updateDeliveryPartner } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getStats);
router.get('/delivery-partners', protect, admin, getDeliveryPartners);
router.put('/delivery-partners/:id', protect, admin, updateDeliveryPartner);

module.exports = router;

