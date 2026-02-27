const express = require('express');
const { getAllUsers, sendReminders } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.post('/send-reminders', protect, adminOnly, sendReminders);

module.exports = router;
