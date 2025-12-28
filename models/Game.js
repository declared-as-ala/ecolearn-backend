const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'dragdrop', 'memory', 'scenario', 'challenge', 'simulation', 'roleplay', 'construction', 'matching', 'audio', 'decision', 'sticker', 'rescue'],
    required: true
  },
  category: {
    type: String,
    enum: ['climate', 'recycling', 'energy', 'biodiversity', 'water', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Game-specific data structure
  gameData: {
    // For quiz
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    // For dragdrop
    items: [{
      id: String,
      label: String,
      category: String
    }],
    // For memory
    cards: [{
      id: String,
      content: String,
      pair: String
    }],
    // For scenario
    scenario: String,
    choices: [{
      id: String,
      text: String,
      impact: Number, // positive or negative impact score
      explanation: String
    }],
    // For challenge
    challenge: String,
    tasks: [{
      id: String,
      description: String,
      points: Number
    }]
  },
  points: {
    type: Number,
    default: 20
  },
  timeLimit: {
    type: Number, // in seconds, 0 for no limit
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);






