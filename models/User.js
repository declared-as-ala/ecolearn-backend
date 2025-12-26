const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    dateOfBirth: Date
  },
  // For students
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  gradeLevel: {
    type: Number,
    enum: [5, 6], // Year 5 or Year 6
    default: null
  },
  badges: [{
    type: String
  }],
  // For parents - link to children
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For teachers - class information
  classCode: {
    type: String,
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on points
userSchema.methods.calculateLevel = function() {
  // Level = floor(points / 100) + 1
  return Math.floor(this.points / 100) + 1;
};

module.exports = mongoose.model('User', userSchema);

