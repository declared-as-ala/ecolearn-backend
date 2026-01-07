const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['achievement', 'progress', 'badge', 'lesson_completed', 'game_completed', 'level_up', 'parent_alert', 'behavioral_alert', 'teacher_feedback', 'challenge_reminder', 'points_earned', 'message'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    type: String, // 'lesson', 'game', 'badge', etc.
    default: null
  },
  relatedId: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String (for course exercises/games)
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

