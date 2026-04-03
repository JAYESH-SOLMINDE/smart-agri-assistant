const express = require('express');
const router = express.Router();
const { getRecommendation, getHistory } = require('../controllers/irrigationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getRecommendation);
router.get('/history', protect, getHistory);

module.exports = router;