const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  gradeLevel: {
    type: Number,
    enum: [5, 6],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  // Course content sections
  sections: {
    video: {
      url: {
        type: String,
        default: ''
      },
      duration: {
        type: Number, // in seconds
        default: 0
      }
    },
    exercises: [{
      id: String,
      type: {
        type: String,
        enum: ['dragdrop', 'matching', 'sequencing', 'truefalse', 'scenario', 'decision', 'sticker', 'quiz'],
        required: true
      },
      title: String,
      content: mongoose.Schema.Types.Mixed, // Flexible content structure
      points: {
        type: Number,
        default: 10
      },
      order: Number
    }],
    games: [{
      id: String,
      type: {
        type: String,
        enum: ['simulation', 'roleplay', 'decision', 'matching', 'repair', 'rescue', 'construction', 'audio', 'sticker'],
        required: true
      },
      title: String,
      description: String,
      gameData: mongoose.Schema.Types.Mixed,
      points: {
        type: Number,
        default: 20
      },
      order: Number,
      unlockAfter: {
        type: String, // exercise id or 'video'
        default: 'video'
      }
    }]
  },
  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
courseSchema.index({ gradeLevel: 1, order: 1 });
courseSchema.index({ courseId: 1 });

module.exports = mongoose.model('Course', courseSchema);

