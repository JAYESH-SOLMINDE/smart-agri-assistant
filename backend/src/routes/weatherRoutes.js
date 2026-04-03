const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');

router.get('/current', protect, getCurrentWeather);
router.get('/forecast', protect, getForecast);

module.exports = router;