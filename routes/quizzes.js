const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// All quizzes
router.get('/', quizController.getQuizzes);
router.post('/', quizController.createQuiz);

// Single quiz
router.get('/:id', quizController.getQuizById);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

// Questions
router.post('/:id/questions', quizController.addQuestion);
router.put('/:quizId/questions/:questionId', quizController.updateQuestion);
router.delete('/:quizId/questions/:questionId', quizController.deleteQuestion);

// Results & Submission
router.get('/:id/results', quizController.getQuizResults);
router.post('/submit', quizController.submitAttempt);

module.exports = router;
