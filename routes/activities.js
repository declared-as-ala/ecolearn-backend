const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Get all activities
router.get('/', activityController.getAllActivities);

// Tree planting specific routes (MUST come before parameterized routes)
router.post('/tree-planting/submit', activityController.submitTreePlanting);
router.get('/tree-planting/my-trees', activityController.getMyTrees);
router.post('/tree-planting/evaluate', activityController.submitEvaluation);
router.get('/tree-planting/student-records', activityController.getStudentRecords);

// Recycled art activity routes (MUST come before parameterized routes)
router.post('/recycled-art/submit', activityController.submitRecycledArt);

// Green cleanliness activity routes (MUST come before parameterized routes)
router.post('/green-cleanliness/submit', activityController.submitGreenCleanliness);

// EcoVillage activity routes (MUST come before parameterized routes)
router.post('/ecovillage/submit', activityController.submitEcoVillage);

// Save activity progress
router.post('/:activityId/progress', activityController.saveProgress);

// Get specific activity (MUST come last - catch-all route)
router.get('/:activityId', activityController.getActivity);

module.exports = router;
