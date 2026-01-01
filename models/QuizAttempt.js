const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
        index: true
    },
    quizVersion: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    results: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        studentAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        pointsEarned: Number
    }],
    timeSpent: {
        type: Number, // in seconds
        required: true
    },
    status: {
        type: String,
        enum: ['pass', 'fail'],
        required: true
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
