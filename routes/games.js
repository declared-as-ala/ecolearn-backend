const express = require('express');
const router = express.Router();
const {
  getGames,
  getGame,
  submitScore
} = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', getGames);
router.get('/:id', getGame);

// Protected routes
router.use(authenticate);
router.post('/:id/submit', submitScore);

module.exports = router;




