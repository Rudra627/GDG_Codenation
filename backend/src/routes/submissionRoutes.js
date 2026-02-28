const express = require('express');
const { submitCode, getUserSubmissions, getAllSubmissions, updateSubmissionStatus, deleteAllSubmissions, runCode } = require('../controllers/submissionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// User Routes
router.post('/run', protect, runCode);
router.post('/', protect, submitCode);
router.get('/history', protect, getUserSubmissions);

// Admin Routes
router.get('/all', protect, adminOnly, getAllSubmissions);
router.delete('/all', protect, adminOnly, deleteAllSubmissions);
router.put('/:id/status', protect, adminOnly, updateSubmissionStatus);

module.exports = router;
