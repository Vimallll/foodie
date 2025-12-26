const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, admin, getUsers);

module.exports = router;

