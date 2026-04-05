const express = require('express');
const { register, login, me, googleAuth, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validation Middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Set up Multer storage for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

router.post(
    '/register', 
    [
        body('name').trim().notEmpty().withMessage('Name is required').escape(),
        body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ], 
    validate, 
    register
);

router.post(
    '/login', 
    [
        body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required')
    ], 
    validate, 
    login
);

router.post('/google', googleAuth);
router.post('/logout', logout);
router.get('/me', protect, me); // Get current logged in user details
router.put('/profile', protect, upload.single('profile_image'), updateProfile); // Update user profile

module.exports = router;
