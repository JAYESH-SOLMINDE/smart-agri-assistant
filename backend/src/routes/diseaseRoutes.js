const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { detectDisease, getHistory, getTreatment } = require('../controllers/diseaseController');
const { protect } = require('../middleware/authMiddleware');

// Configure local file storage (for development)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `leaf-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only JPG/PNG images allowed!'));
    },
});

// Create uploads folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.post('/detect', protect, upload.single('image'), detectDisease);
router.get('/history', protect, getHistory);
router.get('/treatments/:name', protect, getTreatment);

module.exports = router;