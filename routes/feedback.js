const express = require('express');
const router = express.Router();
const {
  sendFeedback,
  sendFeedbackToMultiple,
  sendClassNotification,
  getBehavioralPatterns,
  generateReport
} = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('teacher'));

router.post('/send', sendFeedback);
router.post('/send-multiple', sendFeedbackToMultiple);
router.post('/send-class-notification', sendClassNotification);
router.get('/behavior/:studentId', getBehavioralPatterns);
router.get('/report', generateReport);

module.exports = router;

