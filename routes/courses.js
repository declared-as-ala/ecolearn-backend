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

// Course Management (Teacher only)
router.post('/', courseController.createCourse);
router.delete('/:id', courseController.deleteCourse);

// Mark video as watched
router.post('/:courseId/video/watch', courseController.watchVideo);

// Submit exercise
router.post('/:courseId/exercises/:exerciseId', courseController.submitExercise);

// Submit game
router.post('/:courseId/games/:gameId', courseController.submitGame);

// Exercise Management (Teacher only)
router.post('/:courseId/exercises', courseController.addExercise);
router.put('/:courseId/exercises/:exerciseId', courseController.updateExercise);
router.delete('/:courseId/exercises/:exerciseId', courseController.deleteExercise);

// Game Management (Teacher only)
router.post('/:courseId/games', courseController.addGame);
router.put('/:courseId/games/:gameId', courseController.updateGame);
router.delete('/:courseId/games/:gameId', courseController.deleteGame);

module.exports = router;

