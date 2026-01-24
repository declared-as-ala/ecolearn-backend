const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Get all activities
router.get('/', activityController.getAllActivities);

// Get specific activity
router.get('/:activityId', activityController.getActivity);

// Save activity progress
router.post('/:activityId/progress', activityController.saveProgress);

// Tree planting specific routes
router.post('/tree-planting/submit', activityController.submitTreePlanting);
router.get('/tree-planting/my-trees', activityController.getMyTrees);
router.post('/tree-planting/evaluate', activityController.submitEvaluation);
router.get('/tree-planting/student-records', activityController.getStudentRecords);

// Recycled art activity routes
router.post('/recycled-art/submit', activityController.submitRecycledArt);

// Green cleanliness activity routes
router.post('/green-cleanliness/submit', activityController.submitGreenCleanliness);

// EcoVillage activity routes
router.post('/ecovillage/submit', activityController.submitEcoVillage);

module.exports = router;
