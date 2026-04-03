// diseaseController.js — Sends image to ML service and stores result
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const CropHistory = require('../models/CropHistory');

// ── DETECT DISEASE ────────────────────────────────────
// POST /api/disease/detect
exports.detectDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a leaf image.',
            });
        }

        const { cropType } = req.body;

        // Step 1: Send image to our Python ML service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        formData.append('crop_type', cropType || 'unknown');

        const mlResponse = await axios.post(
            `${process.env.ML_SERVICE_URL}/predict`,
            formData,
            { headers: formData.getHeaders(), timeout: 30000 }
        );

        const prediction = mlResponse.data;

        // Step 2: Save result to database
        const record = await CropHistory.create({
            user: req.user.id,
            imageUrl: req.file.path, // In production, this will be S3 URL
            cropType: cropType || prediction.crop_type,
            prediction: {
                diseaseName: prediction.disease,
                confidenceScore: prediction.confidence,
                isHealthy: prediction.is_healthy,
                treatment: prediction.treatment,
                prevention: prediction.prevention,
                severity: prediction.severity,
            },
        });

        // Step 3: Clean up temp file
        fs.unlink(req.file.path, () => { });

        res.status(200).json({
            success: true,
            result: {
                disease: prediction.disease,
                confidence: `${(prediction.confidence * 100).toFixed(1)}%`,
                isHealthy: prediction.is_healthy,
                treatment: prediction.treatment,
                prevention: prediction.prevention,
                severity: prediction.severity,
            },
            recordId: record._id,
        });
    } catch (error) {
        // Clean up file if error
        if (req.file) fs.unlink(req.file.path, () => { });

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'AI model service is not available. Please try again.',
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET HISTORY ────────────────────────────────────────
// GET /api/disease/history
exports.getHistory = async (req, res) => {
    try {
        const records = await CropHistory.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, count: records.length, records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET TREATMENTS LIST ───────────────────────────────
// GET /api/disease/treatments/:name
exports.getTreatment = async (req, res) => {
    const treatments = {
        'Tomato___Late_blight': {
            treatment: 'Apply copper-based fungicide. Remove infected leaves immediately.',
            prevention: 'Ensure good air circulation. Avoid wetting leaves when watering.',
        },
        'Tomato___Early_blight': {
            treatment: 'Use chlorothalonil or mancozeb fungicide.',
            prevention: 'Rotate crops. Remove plant debris after harvest.',
        },
        'Potato___Late_blight': {
            treatment: 'Apply metalaxyl-based fungicide. Destroy infected plants.',
            prevention: 'Use certified disease-free seed potatoes. Avoid overhead irrigation.',
        },
        'Corn___Common_rust': {
            treatment: 'Apply triazole fungicide in early stages.',
            prevention: 'Plant resistant hybrids. Monitor regularly.',
        },
    };

    const name = req.params.name;
    const info = treatments[name] || {
        treatment: 'Consult your local agricultural extension office.',
        prevention: 'Practice crop rotation and use disease-resistant varieties.',
    };

    res.status(200).json({ success: true, disease: name, ...info });
};