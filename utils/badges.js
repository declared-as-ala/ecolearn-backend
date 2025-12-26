const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// Badge definitions
const BADGES = {
  FIRST_LESSON: 'First Steps',
  FIRST_GAME: 'Game Starter',
  PERFECT_SCORE: 'Perfect Score',
  RECYCLE_MASTER: 'Recycle Master',
  WATER_SAVER: 'Water Saver',
  ENERGY_HERO: 'Energy Hero',
  CLIMATE_CHAMPION: 'Climate Champion',
  LEVEL_5: 'Rising Star',
  LEVEL_10: 'Environmental Expert',
  LEVEL_20: 'Eco Warrior',
  POINTS_100: 'Centurion',
  POINTS_500: 'Point Master',
  POINTS_1000: 'Elite Learner',
  LESSONS_10: 'Knowledge Seeker',
  LESSONS_25: 'Lesson Master',
  GAMES_10: 'Game Enthusiast',
  GAMES_25: 'Game Master',
  STREAK_7: 'Week Warrior',
  STREAK_30: 'Monthly Champion',
};

// Check and award badges
async function checkAndAwardBadges(userId, achievementType, data = {}) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'student') return [];

  const newBadges = [];
  const currentBadges = user.badges || [];

  // Get user stats
  const progress = await Progress.find({ user: userId });
  const completedLessons = progress.filter(p => p.lesson && p.status === 'completed').length;
  const completedGames = progress.filter(p => p.game && p.status === 'completed').length;
  const totalPoints = user.points || 0;
  const level = user.level || 1;

  // Check for specific badges based on achievement type
  switch (achievementType) {
    case 'first_lesson':
      if (!currentBadges.includes(BADGES.FIRST_LESSON)) {
        newBadges.push(BADGES.FIRST_LESSON);
      }
      break;

    case 'first_game':
      if (!currentBadges.includes(BADGES.FIRST_GAME)) {
        newBadges.push(BADGES.FIRST_GAME);
      }
      break;

    case 'perfect_score':
      if (!currentBadges.includes(BADGES.PERFECT_SCORE) && data.score === data.maxScore) {
        newBadges.push(BADGES.PERFECT_SCORE);
      }
      break;

    case 'game_completed':
      // Category-specific badges
      if (data.category === 'recycling' && !currentBadges.includes(BADGES.RECYCLE_MASTER)) {
        const recycleGames = progress.filter(
          p => p.game && p.status === 'completed' && p.game.category === 'recycling'
        ).length;
        if (recycleGames >= 5) {
          newBadges.push(BADGES.RECYCLE_MASTER);
        }
      }
      if (data.category === 'water' && !currentBadges.includes(BADGES.WATER_SAVER)) {
        const waterGames = progress.filter(
          p => p.game && p.status === 'completed' && p.game.category === 'water'
        ).length;
        if (waterGames >= 5) {
          newBadges.push(BADGES.WATER_SAVER);
        }
      }
      if (data.category === 'energy' && !currentBadges.includes(BADGES.ENERGY_HERO)) {
        const energyGames = progress.filter(
          p => p.game && p.status === 'completed' && p.game.category === 'energy'
        ).length;
        if (energyGames >= 5) {
          newBadges.push(BADGES.ENERGY_HERO);
        }
      }
      if (data.category === 'climate' && !currentBadges.includes(BADGES.CLIMATE_CHAMPION)) {
        const climateGames = progress.filter(
          p => p.game && p.status === 'completed' && p.game.category === 'climate'
        ).length;
        if (climateGames >= 5) {
          newBadges.push(BADGES.CLIMATE_CHAMPION);
        }
      }
      break;
  }

  // Check milestone badges
  if (level >= 5 && !currentBadges.includes(BADGES.LEVEL_5)) {
    newBadges.push(BADGES.LEVEL_5);
  }
  if (level >= 10 && !currentBadges.includes(BADGES.LEVEL_10)) {
    newBadges.push(BADGES.LEVEL_10);
  }
  if (level >= 20 && !currentBadges.includes(BADGES.LEVEL_20)) {
    newBadges.push(BADGES.LEVEL_20);
  }

  if (totalPoints >= 100 && !currentBadges.includes(BADGES.POINTS_100)) {
    newBadges.push(BADGES.POINTS_100);
  }
  if (totalPoints >= 500 && !currentBadges.includes(BADGES.POINTS_500)) {
    newBadges.push(BADGES.POINTS_500);
  }
  if (totalPoints >= 1000 && !currentBadges.includes(BADGES.POINTS_1000)) {
    newBadges.push(BADGES.POINTS_1000);
  }

  if (completedLessons >= 10 && !currentBadges.includes(BADGES.LESSONS_10)) {
    newBadges.push(BADGES.LESSONS_10);
  }
  if (completedLessons >= 25 && !currentBadges.includes(BADGES.LESSONS_25)) {
    newBadges.push(BADGES.LESSONS_25);
  }

  if (completedGames >= 10 && !currentBadges.includes(BADGES.GAMES_10)) {
    newBadges.push(BADGES.GAMES_10);
  }
  if (completedGames >= 25 && !currentBadges.includes(BADGES.GAMES_25)) {
    newBadges.push(BADGES.GAMES_25);
  }

  // Award new badges
  if (newBadges.length > 0) {
    user.badges = [...currentBadges, ...newBadges];
    await user.save();

    // Create notifications for each badge
    for (const badge of newBadges) {
      await Notification.create({
        user: userId,
        type: 'badge',
        title: 'Badge Earned!',
        message: `Congratulations! You earned the "${badge}" badge!`,
        relatedTo: 'badge',
      });

      // Notify parents
      const parents = await User.find({ children: userId, role: 'parent' });
      for (const parent of parents) {
        await Notification.create({
          user: parent._id,
          type: 'parent_alert',
          title: 'Child Achievement!',
          message: `Your child ${user.username} earned the "${badge}" badge!`,
          relatedTo: 'badge',
        });
      }
    }
  }

  return newBadges;
}

// Track behavioral patterns
async function trackBehavior(userId, behaviorType, isPositive, details = {}) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'student') return;

  // Store behavioral data in progress or create a separate behavior tracking
  // For now, we'll use notifications to track behavior
  
  if (!isPositive) {
    // Negative behavior - notify parents
    const parents = await User.find({ children: userId, role: 'parent' });
    for (const parent of parents) {
      await Notification.create({
        user: parent._id,
        type: 'parent_alert',
        title: 'Behavioral Alert',
        message: `Your child ${user.username} ${details.message || 'needs improvement in environmental awareness'}.`,
        relatedTo: 'behavior',
      });
    }
  }
}

module.exports = {
  checkAndAwardBadges,
  trackBehavior,
  BADGES,
};




