const mongoose = require('mongoose');

const levelTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['5eme', '6eme'],
    required: true,
    index: true
  },
  score: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: ''
  },
  answers: {
    type: Array,
    default: []
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

levelTestSchema.index({ user: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('LevelTest', levelTestSchema);



