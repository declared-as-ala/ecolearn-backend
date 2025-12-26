const Game = require('../models/Game');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkAndAwardBadges, trackBehavior } = require('../utils/badges');

// Get all games
exports.getGames = async (req, res) => {
  try {
    const { type, category, difficulty } = req.query;
    const query = { isActive: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const games = await Game.find(query);
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single game
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit game score
exports.submitScore = async (req, res) => {
  try {
    const { score, maxScore, answers, timeSpent } = req.body;
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      game: req.params.id
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        game: req.params.id,
        status: 'in_progress'
      });
    }

    progress.score = score;
    progress.maxScore = maxScore;
    progress.answers = answers || [];
    progress.timeSpent = timeSpent || 0;
    progress.attempts += 1;
    progress.lastAttempt = new Date();

    // Calculate if passed (70% or higher)
    const percentage = (score / maxScore) * 100;
    const user = await User.findById(req.user._id);
    
    if (percentage >= 70) {
      progress.status = 'completed';
      progress.completedAt = new Date();

      // Track positive behavior
      progress.behavioralPatterns = progress.behavioralPatterns || [];
      progress.behavioralPatterns.push({
        type: 'positive',
        category: game.category,
        description: `Completed ${game.title} with ${percentage.toFixed(0)}% score`
      });

      // Award points
      const oldLevel = user.level;
      user.points += game.points;
      user.level = user.calculateLevel();
      await user.save();

      // Check if this is first game
      const allGameProgress = await Progress.find({ 
        user: user._id, 
        game: { $ne: null }, 
        status: 'completed' 
      });
      const isFirstGame = allGameProgress.length === 1;

      // Check and award badges
      const newBadges = await checkAndAwardBadges(user._id, 'game_completed', {
        category: game.category,
        score,
        maxScore
      });

      // Check for perfect score badge
      if (score === maxScore) {
        await checkAndAwardBadges(user._id, 'perfect_score', { score, maxScore });
      }

      // Check for first game badge
      if (isFirstGame) {
        await checkAndAwardBadges(user._id, 'first_game');
      }

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

      // Create completion notification
      await Notification.create({
        user: user._id,
        type: 'game_completed',
        title: 'Game Completed!',
        message: `You completed "${game.title}" and earned ${game.points} points!`,
        relatedTo: 'game',
        relatedId: game._id
      });

      // Notify parents
      const parents = await User.find({ children: user._id, role: 'parent' });
      for (const parent of parents) {
        await Notification.create({
          user: parent._id,
          type: 'parent_alert',
          title: 'Child Achievement!',
          message: `Your child ${user.username} completed "${game.title}" with ${percentage.toFixed(0)}% score!`,
          relatedTo: 'game',
          relatedId: game._id
        });
      }

      await progress.save();
      res.json({ 
        progress, 
        user: { points: user.points, level: user.level, badges: user.badges },
        passed: true,
        message: 'Congratulations! You passed!',
        badges: newBadges
      });
    } else {
      progress.status = 'failed';
      progress.feedback = 'Score below 70%. Try again to improve!';
      
      // Track negative behavior
      progress.behavioralPatterns = progress.behavioralPatterns || [];
      progress.behavioralPatterns.push({
        type: 'negative',
        category: game.category,
        description: `Failed ${game.title} with ${percentage.toFixed(0)}% score - needs improvement`
      });

      // Track behavior for parents
      await trackBehavior(user._id, 'game_failure', false, {
        message: `frequently struggles with ${game.category} games (scored ${percentage.toFixed(0)}%)`,
        gameTitle: game.title
      });

      await progress.save();
      res.json({ 
        progress, 
        passed: false,
        message: 'Score below passing threshold. Try again!',
        needsMiniChallenge: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

