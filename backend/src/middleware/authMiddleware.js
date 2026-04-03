// authMiddleware.js — Checks if user is logged in before
// allowing access to protected routes
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in the request header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please log in.',
            });
        }

        // Verify the token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Attach user to request so next functions can use it
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please log in again.',
        });
    }
};

module.exports = { protect };