// irrigationController.js — Smart irrigation recommendations
const IrrigationLog = require('../models/IrrigationLog');
const axios = require('axios');

// ── CROP WATER NEEDS (liters per acre per day) ────────
// These are standard agricultural values
const CROP_WATER_NEEDS = {
    rice: 8000,
    wheat: 4500,
    corn: 5000,
    tomato: 4000,
    potato: 3500,
    cotton: 6000,
    sugarcane: 9000,
    soybean: 4000,
    default: 4500,
};

// ── SOIL RETENTION FACTOR ─────────────────────────────
// How well each soil type holds water
const SOIL_FACTOR = {
    sandy: 0.6,   // drains fast, needs more water
    loamy: 1.0,   // perfect balance
    clay: 1.4,   // holds water, needs less
    silty: 1.1,
    peaty: 1.2,
};

// ── GROWTH STAGE FACTOR ───────────────────────────────
const STAGE_FACTOR = {
    seedling: 0.4,
    vegetative: 0.8,
    flowering: 1.2, // needs most water
    fruiting: 1.0,
    harvest: 0.5,
};

// ── GET RECOMMENDATION ────────────────────────────────
// POST /api/irrigation/recommend
exports.getRecommendation = async (req, res) => {
    try {
        const {
            cropType,
            soilType,
            growthStage,
            fieldArea = 1,     // default 1 acre
            currentSoilMoisture = 50, // 0-100
            lat,
            lon,
        } = req.body;

        // Step 1: Get current weather
        let weather = {};
        try {
            const weatherRes = await axios.get(
                `${process.env.OPENWEATHER_BASE_URL}/weather`,
                {
                    params: {
                        lat, lon,
                        appid: process.env.OPENWEATHER_API_KEY,
                        units: 'metric',
                    },
                }
            );
            const d = weatherRes.data;
            weather = {
                temperature: d.main.temp,
                humidity: d.main.humidity,
                rainfall: d.rain ? d.rain['1h'] || 0 : 0,
                windSpeed: d.wind.speed,
                forecast: d.weather[0].description,
            };
        } catch {
            // Use default values if weather API fails
            weather = { temperature: 28, humidity: 60, rainfall: 0, windSpeed: 3 };
        }

        // Step 2: Calculate water needed
        const baseNeed = CROP_WATER_NEEDS[cropType.toLowerCase()] || CROP_WATER_NEEDS.default;
        const soilMult = SOIL_FACTOR[soilType] || 1.0;
        const stageMult = STAGE_FACTOR[growthStage] || 1.0;

        // Evapotranspiration adjustment: more water needed when hotter
        const tempFactor = 1 + (weather.temperature - 25) * 0.02;

        // Rainfall reduction
        const effectiveRain = weather.rainfall * 1000; // mm to liters approx

        let waterNeeded = baseNeed * soilMult * stageMult * tempFactor * fieldArea;
        waterNeeded = Math.max(0, waterNeeded - effectiveRain);

        // Step 3: Decide whether to irrigate
        const shouldIrrigate =
            currentSoilMoisture < 40 ||
            (currentSoilMoisture < 60 && weather.temperature > 35) ||
            (currentSoilMoisture < 70 && growthStage === 'flowering');

        // Step 4: Build recommendation
        const recommendation = {
            shouldIrrigate,
            waterAmount: Math.round(waterNeeded),
            bestTime: weather.temperature > 30 ? 'Early morning (6–8 AM)' : 'Evening (5–7 PM)',
            nextIrrigationDate: getNextIrrigationDate(soilType, weather),
            reason: buildReason(shouldIrrigate, currentSoilMoisture, weather),
            tips: buildTips(cropType, soilType, weather),
        };

        // Step 5: Save to database
        const log = await IrrigationLog.create({
            user: req.user.id,
            input: { cropType, soilType, growthStage, fieldArea, currentSoilMoisture },
            recommendation,
            weatherUsed: weather,
        });

        res.status(200).json({ success: true, recommendation, logId: log._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET HISTORY ────────────────────────────────────────
// GET /api/irrigation/history
exports.getHistory = async (req, res) => {
    try {
        const logs = await IrrigationLog.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, count: logs.length, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── HELPERS ───────────────────────────────────────────
function getNextIrrigationDate(soilType, weather) {
    const daysMap = { sandy: 1, loamy: 2, clay: 4, silty: 3, peaty: 3 };
    const days = daysMap[soilType] || 2;
    const next = new Date();
    next.setDate(next.getDate() + (weather.rainfall > 5 ? days + 1 : days));
    return next;
}

function buildReason(shouldIrrigate, soilMoisture, weather) {
    if (!shouldIrrigate) return `Soil moisture (${soilMoisture}%) is adequate. No irrigation needed today.`;
    if (soilMoisture < 40) return `Soil moisture is critically low (${soilMoisture}%). Irrigate immediately.`;
    if (weather.temperature > 35) return `High temperature (${weather.temperature}°C) with moderate moisture. Irrigation recommended.`;
    return `Irrigation recommended based on crop stage and weather conditions.`;
}

function buildTips(cropType, soilType, weather) {
    const tips = [];
    if (soilType === 'sandy') tips.push('Sandy soil drains fast — use drip irrigation for best results.');
    if (weather.windSpeed > 8) tips.push('Windy today — use drip or sprinkler instead of flood irrigation.');
    if (weather.humidity > 80) tips.push('High humidity detected — avoid overhead watering to prevent disease.');
    tips.push(`Best method for ${cropType}: ${cropType === 'rice' ? 'Flood irrigation' : 'Drip or sprinkler irrigation'}`);
    return tips;
}