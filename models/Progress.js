const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    default: null
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  courseSection: {
    type: String,
    enum: ['video', 'exercise', 'game'],
    default: null
  },
  sectionId: {
    type: String, // ID of the specific exercise or game within the course
    default: null
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'failed'],
    default: 'not_started'
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  // For games - store answers/results
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    timestamp: Date
  }],
  feedback: {
    type: String
  },
  // Behavioral tracking
  behavioralPatterns: [{
    type: {
      type: String, // 'positive', 'negative'
      enum: ['positive', 'negative']
    },
    category: String, // 'water', 'energy', 'recycling', etc.
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
progressSchema.index({ user: 1, lesson: 1 });
progressSchema.index({ user: 1, game: 1 });
progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ user: 1, course: 1, courseSection: 1, sectionId: 1 });

module.exports = mongoose.model('Progress', progressSchema);

