const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all courses for a grade level
router.get('/', courseController.getCourses);

// Get single course by ID
router.get('/:id', courseController.getCourseById);

// Mark video as watched
router.post('/:courseId/video/watch', courseController.watchVideo);

// Submit exercise
router.post('/:courseId/exercises/:exerciseId', courseController.submitExercise);

// Submit game
router.post('/:courseId/games/:gameId', courseController.submitGame);

module.exports = router;

