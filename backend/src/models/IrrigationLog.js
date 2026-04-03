// IrrigationLog.js — Stores irrigation recommendations
const mongoose = require('mongoose');

const irrigationLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // What the farmer told us
        input: {
            cropType: { type: String, required: true },
            soilType: {
                type: String,
                enum: ['sandy', 'loamy', 'clay', 'silty', 'peaty'],
                required: true,
            },
            growthStage: {
                type: String,
                enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'],
                required: true,
            },
            fieldArea: { type: Number }, // in acres
            currentSoilMoisture: { type: Number }, // 0-100 percentage (from IoT or manual)
        },
        // What our system recommended
        recommendation: {
            shouldIrrigate: { type: Boolean, required: true },
            waterAmount: { type: Number },      // Liters per acre
            bestTime: { type: String },         // e.g. "Early morning 6-8 AM"
            nextIrrigationDate: { type: Date },
            reason: { type: String },           // Why we gave this recommendation
            tips: [String],                     // Extra tips array
        },
        // Weather used to calculate this
        weatherUsed: {
            temperature: Number,
            humidity: Number,
            rainfall: Number,
            windSpeed: Number,
            forecast: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('IrrigationLog', irrigationLogSchema);