// CropHistory.js — Stores every disease detection result
const mongoose = require('mongoose');

const cropHistorySchema = new mongoose.Schema(
    {
        // Which farmer made this request
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Image details
        imageUrl: {
            type: String,
            required: true,
        },
        // Crop information entered by farmer
        cropType: {
            type: String,
            required: true,
            // e.g. "Tomato", "Potato", "Corn"
        },
        // AI result
        prediction: {
            diseaseName: { type: String, required: true },
            confidenceScore: { type: Number, required: true }, // 0.0 to 1.0
            isHealthy: { type: Boolean, default: false },
            treatment: { type: String },        // What to do
            prevention: { type: String },       // How to prevent next time
            severity: {
                type: String,
                enum: ['none', 'low', 'medium', 'high'],
                default: 'none',
            },
        },
        // Weather at the time of detection (helpful context)
        weatherAtDetection: {
            temperature: Number,
            humidity: Number,
            condition: String,
        },
        notes: String, // Farmer's own notes
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('CropHistory', cropHistorySchema);