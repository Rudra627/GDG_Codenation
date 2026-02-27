const express = require('express');
const { getAllUsers, sendReminders, deleteUser, toggleBlockUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.post('/send-reminders', protect, adminOnly, sendReminders);
router.delete('/:id', protect, adminOnly, deleteUser);
router.put('/:id/block', protect, adminOnly, toggleBlockUser);

module.exports = router;
