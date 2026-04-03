// server.js — This is the ENTRY POINT of our backend
// It starts the server and connects to the database

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables from .env file
dotenv.config();

// Create the Express app
const app = express();

// ── Security Middleware ──────────────────────────────
app.use(helmet());           // Adds security headers
app.use(cors());             // Allows mobile app to talk to backend
app.use(morgan('dev'));       // Logs every request in terminal

// ── Body Parsing ─────────────────────────────────────
app.use(express.json());                          // Read JSON data
app.use(express.urlencoded({ extended: true }));  // Read form data

// ── Rate Limiting ─────────────────────────────────────
// Prevents someone from spamming our API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // max 100 requests per 15 min
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────
// We'll add these one by one
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/irrigation', require('./routes/irrigationRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));

// ── Health Check ─────────────────────────────────────
// Visit http://localhost:5000/health to check if server is running
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Smart Agri API is running!' });
});

// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ── Connect to MongoDB & Start Server ─────────────────
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });