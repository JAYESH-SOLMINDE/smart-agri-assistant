// weatherController.js — Fetches real-time weather data
const axios = require('axios');

const BASE_URL = process.env.OPENWEATHER_BASE_URL;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// ── CURRENT WEATHER ───────────────────────────────────
// GET /api/weather/current?lat=18.52&lon=73.85
exports.getCurrentWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Please provide lat and lon query parameters.',
            });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: { lat, lon, appid: API_KEY, units: 'metric' },
        });

        const data = response.data;

        // Extract only the fields we need
        const weather = {
            city: data.name,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            condition: data.weather[0].description,
            conditionCode: data.weather[0].id,
            windSpeed: data.wind.speed,
            rainfall: data.rain ? data.rain['1h'] || 0 : 0,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            // Farming alert logic
            alerts: generateFarmingAlerts(data),
        };

        res.status(200).json({ success: true, weather });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── 5-DAY FORECAST ────────────────────────────────────
// GET /api/weather/forecast?lat=18.52&lon=73.85
exports.getForecast = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 },
        });

        // Simplify the forecast data
        const forecast = response.data.list.map((item) => ({
            datetime: item.dt_txt,
            temp: item.main.temp,
            humidity: item.main.humidity,
            condition: item.weather[0].description,
            rainfall: item.rain ? item.rain['3h'] || 0 : 0,
            windSpeed: item.wind.speed,
        }));

        res.status(200).json({ success: true, forecast });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── HELPER: Generate farming-specific alerts ──────────
function generateFarmingAlerts(data) {
    const alerts = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const conditionId = data.weather[0].id;

    if (temp > 40)
        alerts.push({ type: 'heat', message: '🌡️ Extreme heat! Water crops early morning.' });
    if (humidity > 85)
        alerts.push({ type: 'humidity', message: '💧 High humidity. Watch for fungal diseases.' });
    if (windSpeed > 10)
        alerts.push({ type: 'wind', message: '💨 Strong winds. Avoid spraying pesticides today.' });
    if (conditionId >= 200 && conditionId < 600)
        alerts.push({ type: 'rain', message: '🌧️ Rain expected. You may skip irrigation today.' });

    return alerts;
}