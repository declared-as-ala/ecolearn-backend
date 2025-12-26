const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: ['lesson', 'game'],
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  deadline: {
    type: Date,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'overdue'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
assignmentSchema.index({ teacher: 1, student: 1 });
assignmentSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);

