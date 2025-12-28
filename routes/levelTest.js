const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const levelTestController = require('../controllers/levelTestController');

router.use(authenticate);

router.get('/status', levelTestController.getStatus);
router.post('/submit', levelTestController.submit);

module.exports = router;

