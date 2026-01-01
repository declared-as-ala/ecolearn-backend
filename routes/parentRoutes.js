const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('parent'));

router.post('/link-student', parentController.linkStudent);
router.get('/students', parentController.getLinkedStudents);
router.get('/students/:id/profile', parentController.getStudentProfile);
router.get('/teachers', parentController.getTeachers);
router.post('/messages', parentController.sendMessage);
router.get('/messages/:teacherId', parentController.getMessages);

module.exports = router;
