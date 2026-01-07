const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    image: String,
    type: {
        type: String,
        enum: ['mcq', 'truefalse', 'multiple', 'image', 'scenario'],
        required: true
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    explanation: String,
    points: {
        type: Number,
        default: 5
    },
    order: Number
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    gradeLevel: {
        type: Number,
        enum: [5, 6],
        required: true
    },
    courseId: {
        type: String, // String ID of the course
        required: true
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    timeLimit: {
        type: Number, // in minutes
        default: null
    },
    passScore: {
        type: Number, // percentage
        default: 70
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    version: {
        type: Number,
        default: 1
    },
    questions: [questionSchema],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: Date,
    endDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update totalPoints and updatedAt before saving
quizSchema.pre('save', function () {
    if (this.questions && this.questions.length > 0) {
        this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    } else {
        this.totalPoints = 0;
    }
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Quiz', quizSchema);
