const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user progress
exports.getProgress = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const progress = await Progress.find({ user: userId })
      .populate('course', 'title courseId')
      .populate('lesson', 'title category')
      .populate('game', 'title type')
      .sort({ lastAttempt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add points to user account (direct endpoint)
exports.addPoints = async (req, res) => {
  try {
    const { points, type, description, courseId, activityId } = req.body;
    const userId = req.user._id;

    if (!points || isNaN(points)) {
      return res.status(400).json({ message: 'Valid points value is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldPoints = user.points || 0;
    const addedPoints = parseInt(points) || 0;
    user.points = oldPoints + addedPoints;
    
    // Recalculate level
    if (typeof user.calculateLevel === 'function') {
      user.level = user.calculateLevel();
    } else {
      user.level = Math.floor(user.points / 100) + 1;
    }
    
    await user.save();

    console.log(`💰 [addPoints] User ${user.username} earned ${addedPoints} points. Total: ${user.points}`);

    // Create a notification for the points - fail gracefully if notification creation fails
    try {
      await Notification.create({
        user: userId,
        type: 'points_earned',
        title: 'نقاط جديدة! 🌟',
        message: `لقد حصلت على ${addedPoints} نقطة ${description ? `من أجل ${description}` : ''}!`,
        relatedTo: type || 'activity',
        relatedId: activityId || courseId
      });
    } catch (notificationError) {
      console.error('⚠️ [addPoints] Failed to create notification, but points were saved:', notificationError.message);
    }

    res.json({
      message: 'Points added successfully',
      points: user.points,
      level: user.level,
      user: {
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('❌ [addPoints] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find({ role: 'student' })
      .select('username profile points level badges gradeLevel')
      .sort({ points: -1 })
      .limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user grade level
exports.updateGradeLevel = async (req, res) => {
  try {
    const { gradeLevel } = req.body;
    
    if (!gradeLevel || (gradeLevel !== 5 && gradeLevel !== 6)) {
      return res.status(400).json({ message: 'Valid gradeLevel (5 or 6) is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { gradeLevel },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Grade level updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// For parents: Get children
exports.getChildren = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate('children');
    res.json(parent.children || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// For parents: Link child
exports.linkChild = async (req, res) => {
  try {
    const { childUsername } = req.body;
    const child = await User.findOne({ username: childUsername, role: 'student' });
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(child._id)) {
      parent.children.push(child._id);
      await parent.save();
    }

    res.json({ message: 'Child linked successfully', child });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// For teachers: Get students
exports.getStudents = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate('students');
    res.json(teacher.students || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




