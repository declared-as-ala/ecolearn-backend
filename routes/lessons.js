const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLesson,
  startLesson,
  completeLesson
} = require('../controllers/lessonController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', getLessons);
router.get('/:id', getLesson);

// Protected routes
router.use(authenticate);
router.post('/:id/start', startLesson);
router.post('/:id/complete', completeLesson);

module.exports = router;




