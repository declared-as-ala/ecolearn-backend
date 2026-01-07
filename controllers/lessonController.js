const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkAndAwardBadges } = require('../utils/badges');

// Get all lessons
exports.getLessons = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const lessons = await Lesson.find(query).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single lesson
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start lesson (create progress)
exports.startLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      lesson: req.params.id
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        lesson: req.params.id,
        status: 'in_progress'
      });
      await progress.save();
    }

    res.json({ lesson, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete lesson
exports.completeLesson = async (req, res) => {
  try {
    const { timeSpent } = req.body;
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      lesson: req.params.id
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        lesson: req.params.id
      });
    }

    progress.status = 'completed';
    progress.timeSpent = timeSpent || 0;
    progress.completedAt = new Date();
    progress.attempts += 1;
    await progress.save();

    // Award points
    const user = await User.findById(req.user._id);
    const oldLevel = user.level;
    user.points += lesson.points;
    user.level = user.calculateLevel();
    await user.save();

    // Check for level up
    if (user.level > oldLevel) {
      await Notification.create({
        user: user._id,
        type: 'level_up',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${user.level}!`,
        relatedTo: 'level'
      });
    }

    // Check if this is first lesson
    const allProgress = await Progress.find({ user: user._id, lesson: { $ne: null }, status: 'completed' });
    const isFirstLesson = allProgress.length === 1;

    // Check and award badges
    const newBadges = await checkAndAwardBadges(user._id, 'first_lesson');

    // Create completion notification
    await Notification.create({
      user: user._id,
      type: 'lesson_completed',
      title: 'Lesson Completed!',
      message: `You completed "${lesson.title}" and earned ${lesson.points} points!`,
      relatedTo: 'lesson',
      relatedId: lesson._id
    });

    // Notify parents
    const parents = await User.find({ children: user._id, role: 'parent' });
    for (const parent of parents) {
      await Notification.create({
        user: parent._id,
        type: 'parent_alert',
        title: 'Child Progress Update',
        message: `Your child ${user.username} completed "${lesson.title}"!`,
        relatedTo: 'lesson',
        relatedId: lesson._id
      });
    }

    res.json({ 
      progress, 
      user: { points: user.points, level: user.level, badges: user.badges },
      badges: newBadges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

