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
  getClassOverview,
  getStudentFullProfile,
  resetStudentProgress,
  reassignQuiz,
  addStudentNote,
  removeStudentBadge,
  toggleCourseAccess,
  getParents,
  getMessages,
  sendMessage
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
router.get('/students/:studentId/full-profile', getStudentFullProfile);
router.post('/students/:studentId/reset-progress', resetStudentProgress);
router.post('/students/:studentId/reassign-quiz', reassignQuiz);
router.post('/students/:studentId/notes', addStudentNote);
router.delete('/students/:studentId/badges/:badgeId', removeStudentBadge);
router.post('/students/:studentId/toggle-course', toggleCourseAccess);

// Activity assignment
router.post('/assign', assignActivity);

// Messaging
router.get('/parents', getParents);
router.get('/messages/:parentId', getMessages);
router.post('/messages', sendMessage);

module.exports = router;

