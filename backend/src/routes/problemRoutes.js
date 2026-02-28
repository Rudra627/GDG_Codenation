const express = require('express');
const { 
    createProblem, 
    getProblems, 
    getProblemById, 
    updateProblem, 
    deleteProblem,
    addTestCase,
    getTestCases,
    getSampleTestCases,
    setDailyChallenge,
    getProblemsWithUserStatus
} = require('../controllers/problemController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// Public/User Routes
router.get('/', getProblems);
router.get('/user-status', protect, getProblemsWithUserStatus);
router.get('/:id', getProblemById);
router.get('/:id/samples', protect, getSampleTestCases);

// Admin Routes (Protect + AdminOnly)
router.post('/', protect, adminOnly, createProblem);
router.put('/:id', protect, adminOnly, updateProblem);
router.delete('/:id', protect, adminOnly, deleteProblem);

// Test Cases
router.post('/:id/testcases', protect, adminOnly, addTestCase);
router.get('/:id/testcases', protect, adminOnly, getTestCases);

// Daily Challenge
router.put('/:id/daily', protect, adminOnly, setDailyChallenge);

module.exports = router;
