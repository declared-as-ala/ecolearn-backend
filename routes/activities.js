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

module.exports = router;
