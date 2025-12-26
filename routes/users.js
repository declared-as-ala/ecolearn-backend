const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getProgress,
  getLeaderboard,
  getChildren,
  linkChild,
  getStudents,
  updateGradeLevel
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile/:id', getProfile);
router.put('/profile', updateProfile);
router.put('/grade-level', updateGradeLevel);

// Progress routes
router.get('/progress', getProgress);
router.get('/progress/:id', getProgress);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Parent routes
router.get('/children', authorize('parent'), getChildren);
router.post('/children/link', authorize('parent'), linkChild);

// Teacher routes
router.get('/students', authorize('teacher'), getStudents);

module.exports = router;

