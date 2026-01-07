const LevelTest = require('../models/LevelTest');

const normalizeLevel = (level) => {
  if (level === 5 || level === '5' || (typeof level === 'string' && level.toLowerCase() === '5eme')) return '5eme';
  if (level === 6 || level === '6' || (typeof level === 'string' && level.toLowerCase() === '6eme')) return '6eme';
  return null;
};

exports.getStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const level = normalizeLevel(req.query.level);
    if (!level) {
      return res.status(400).json({ message: 'level is required (5eme or 6eme)' });
    }

    const existing = await LevelTest.findOne({ user: userId, level });
    if (!existing) {
      return res.json({ completed: false, score: 0, category: null, level });
    }

    return res.json({
      completed: !!existing.completed,
      score: existing.score,
      category: existing.category,
      level: existing.level,
      completedAt: existing.completedAt
    });
  } catch (error) {
    console.error('❌ [levelTest.getStatus] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { answers = [], score = 0, category = '' } = req.body;
    const level = normalizeLevel(req.body.level);

    if (!level) {
      return res.status(400).json({ message: 'level is required (5eme or 6eme)' });
    }

    const test = await LevelTest.findOneAndUpdate(
      { user: userId, level },
      {
        $set: {
          answers,
          score,
          category,
          completed: true,
          completedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      completed: true,
      score: test.score,
      category: test.category,
      level: test.level,
      completedAt: test.completedAt
    });
  } catch (error) {
    console.error('❌ [levelTest.submit] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



