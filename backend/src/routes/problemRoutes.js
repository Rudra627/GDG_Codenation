const express = require('express');
const { 
    createProblem, getProblems, getProblemById, updateProblem, deleteProblem,
    addTestCase, getTestCases, getSampleTestCases, setDailyChallenge, getProblemsWithUserStatus
} = require('../controllers/problemController');
const { getTemplate, saveTemplate, deleteTemplate, getAllTemplatesForProblem } = require('../controllers/templateController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// Public Routes
router.get('/', getProblems);
router.get('/user-status', protect, getProblemsWithUserStatus);
router.get('/:id', getProblemById);
router.get('/:id/samples', getSampleTestCases);          // public - non-hidden only
router.get('/:id/template/:language', getTemplate);      // public - starter code for editor

// Admin - Problems
router.post('/', protect, adminOnly, createProblem);
router.put('/:id', protect, adminOnly, updateProblem);
router.delete('/:id', protect, adminOnly, deleteProblem);
router.put('/:id/daily', protect, adminOnly, setDailyChallenge);

// Admin - Test Cases
router.post('/:id/testcases', protect, adminOnly, addTestCase);
router.get('/:id/testcases', protect, adminOnly, getTestCases);

// Admin - Code Templates
router.get('/:id/templates', protect, adminOnly, getAllTemplatesForProblem);
router.post('/:id/template', protect, adminOnly, saveTemplate);
router.delete('/:id/template/:language', protect, adminOnly, deleteTemplate);

module.exports = router;
