const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get all quizzes
exports.getQuizzes = async (req, res) => {
    try {
        const { gradeLevel, status } = req.query;
        let query = {};
        if (gradeLevel) query.gradeLevel = gradeLevel;
        if (status) query.status = status;

        const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single quiz
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create quiz skeleton
exports.createQuiz = async (req, res) => {
    try {
        const { title, gradeLevel, courseId, teacherId } = req.body;
        const newQuiz = new Quiz({
            title,
            gradeLevel,
            courseId,
            teacher: teacherId || req.user?.id, // Use provided teacherId or from token
            questions: []
        });
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update quiz properties
exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Handle versioning if structural changes are made to a published quiz
        const hasAttempts = await QuizAttempt.exists({ quiz: req.params.id });
        if (hasAttempts && quiz.status === 'published') {
            quiz.version += 1;
        }

        Object.assign(quiz, req.body);
        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Safety: check for attempts if needed, but for now allow delete
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add question to quiz
exports.addQuestion = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.questions.push(req.body);
        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update specific question
exports.updateQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const questionIndex = quiz.questions.findIndex(q => q._id.toString() === questionId);
        if (questionIndex === -1) return res.status(404).json({ message: 'Question not found' });

        quiz.questions[questionIndex] = { ...quiz.questions[questionIndex].toObject(), ...req.body };
        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete specific question
exports.deleteQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.questions = quiz.questions.filter(q => q._id.toString() !== questionId);
        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get quiz results for analytics
exports.getQuizResults = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ quiz: req.params.id })
            .populate('user', 'username profile')
            .sort({ attemptedAt: -1 });
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Submit quiz attempt (Student side)
exports.submitAttempt = async (req, res) => {
    try {
        const { quizId, studentId, results, timeSpent } = req.body;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Calculate score
        let totalScore = 0;
        const processedResults = results.map(res => {
            const question = quiz.questions.id(res.questionId);
            if (!question) return { ...res, isCorrect: false, pointsEarned: 0 };

            // Simple logic for now: full points if correct
            const isCorrect = res.isCorrect; // Frontend calculates for now, or backend can verify
            const pointsEarned = isCorrect ? question.points : 0;
            totalScore += pointsEarned;

            return {
                ...res,
                pointsEarned,
                isCorrect
            };
        });

        const percentage = (totalScore / quiz.totalPoints) * 100;
        const status = percentage >= quiz.passScore ? 'pass' : 'fail';

        const attempt = new QuizAttempt({
            user: studentId || req.user?.id,
            quiz: quizId,
            quizVersion: quiz.version,
            score: totalScore,
            percentage,
            results: processedResults,
            timeSpent,
            status
        });

        await attempt.save();
        res.status(201).json(attempt);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
