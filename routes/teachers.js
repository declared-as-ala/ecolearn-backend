const express = require('express');
const router = express.Router();
const {
  createClass,
  assignStudentByCode,
  assignStudentByUsername,
  removeStudent,
  getStudentsWithProgress,
  getStudentProgress,
  assignActivity,
  getClassOverview
} = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('teacher'));

// Class management
router.post('/class/create', createClass);
router.get('/class/overview', getClassOverview);

// Student management
router.post('/students/assign', assignStudentByUsername);
router.delete('/students/:studentId', removeStudent);
router.get('/students', getStudentsWithProgress);
router.get('/students/:studentId/progress', getStudentProgress);

// Activity assignment
router.post('/assign', assignActivity);

module.exports = router;

