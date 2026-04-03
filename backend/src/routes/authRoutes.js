const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateFcmToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/fcm-token', protect, updateFcmToken);

module.exports = router;