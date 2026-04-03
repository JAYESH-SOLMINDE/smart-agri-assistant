// User.js — Blueprint for storing farmer information
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // allows null/undefined (email is optional)
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false, // Never return password in queries
        },
        language: {
            type: String,
            enum: ['en', 'hi', 'mr', 'ta', 'te'], // en=English, hi=Hindi, mr=Marathi
            default: 'en',
        },
        location: {
            state: String,
            district: String,
            village: String,
            coordinates: {
                lat: Number,
                lon: Number,
            },
        },
        fcmToken: String, // Firebase token for push notifications
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Before saving, encrypt the password
userSchema.pre('save', async function (next) {
    // Only hash if password was changed
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check if entered password is correct
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);