// authController.js — Handles Register and Login
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: Create a JWT token for a user
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Helper: Send token in response
const sendTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            language: user.language,
            location: user.location,
        },
    });
};

// ── REGISTER ─────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, phone, email, password, language, location } = req.body;

        // Check if phone already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered.',
            });
        }

        const user = await User.create({
            name,
            phone,
            email,
            password,
            language: language || 'en',
            location,
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── LOGIN ─────────────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone and password.',
            });
        }

        // Find user and include password (we excluded it by default)
        const user = await User.findOne({ phone }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect phone number or password.',
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET PROFILE ───────────────────────────────────────
// GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── UPDATE FCM TOKEN ──────────────────────────────────
// PUT /api/auth/fcm-token
exports.updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(req.user.id, { fcmToken });
        res.status(200).json({ success: true, message: 'FCM token updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};