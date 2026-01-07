const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// Badge definitions
const BADGES = {
  FIRST_LESSON: 'خطواتي الأولى 👣',
  FIRST_GAME: 'بداية اللعب 🎮',
  PERFECT_SCORE: 'العلامة الكاملة ⭐',
  RECYCLE_MASTER: 'خبير التدوير ♻️',
  WATER_SAVER: 'محافظ على الماء 💧',
  ENERGY_HERO: 'بطل الطاقة ⚡',
  CLIMATE_CHAMPION: 'حامي المناخ 🌍',
  LEVEL_5: 'نجم صاعد ✨',
  LEVEL_10: 'خبير بيئي 🌿',
  LEVEL_20: 'محارب البيئة 🛡️',
  POINTS_100: 'مئة نقطة 💯',
  POINTS_500: 'صائد النقاط 🎯',
  POINTS_1000: 'المتعلم المتميز 🏆',
  LESSONS_10: 'باحث عن المعرفة 📚',
  LESSONS_25: 'سيد الدروس 🎓',
  GAMES_10: 'محب الألعاب 🕹️',
  GAMES_25: 'سيد الألعاب 👑',
  STREAK_7: 'محارب الأسبوع 🔥',
  STREAK_30: 'بطل الشهر 🌙',
  WATER_EXPLORER: 'مكتشف دورة الماء 🌊',
  WATER_WIZARD: 'ساحر الماء الصغير 🧙‍♂️',
  WATER_GUARDIAN: 'حارس العناصر الطبيعية 🛡️',
  CHAMPION_WATER: 'بطل الماء والعناصر الطبيعية 🌍',
  BALANCE_EXPERT: 'خبير التوازن البيئي ⚖️',
  SOIL_FRIEND: 'صديق التربة 🪱',
  BALANCE_SAVIOR: 'منقذ التوازن 🕊️',
  CHAMPION_BALANCE: 'بطل التوازن البيئي 🌍⚖️',
  BALANCE_SHIELD: 'درع التوازن 🛡️',
  ISLAND_RESCUER: 'منقذ الجزيرة 🏝️',
  ECO_ENGINEER: 'مهندس الحلول البيئية 🛠️',
  CHAMPION_PREVENTION: 'بطل منع الاختلال البيئي 🚫🌍',
  FORREST_GUARDIAN: 'حارس الغابة 🌳',
  CREATURE_FRIEND: 'صديق الكائنات 🐢',
  REPAIR_EXPERT: 'خبير الإصلاح البيئي ✨',
  ACTIVE_HERO: 'بطل بيئي نشط 🏃‍♂️',
  NATURE_OBSERVER: 'بطل مراقبة الطبيعة 🔍',
  ECO_WEB_ENGINEER: 'مهندس التوازن البيئي 🕸️',
  ULTIMATE_HERO: 'البطل البيئي الأسمى 🌍🌟',
};

// Check and award badges
async function checkAndAwardBadges(userId, achievementType, data = {}) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'student') return [];

  const newBadges = [];
  const currentBadges = user.badges || [];

  // Get user stats
  const progress = await Progress.find({ user: userId });
  const completedLessons = progress.filter(p => (p.lesson || p.courseSection === 'exercise') && p.status === 'completed').length;
  const completedGames = progress.filter(p => (p.game || p.courseSection === 'game') && p.status === 'completed').length;
  const totalPoints = user.points || 0;
  const level = user.level || 1;

  // Check for specific badges based on achievement type
  switch (achievementType) {
    case 'first_lesson':
    case 'exercise_completed':
      if (completedLessons === 1 && !currentBadges.includes(BADGES.FIRST_LESSON)) {
        newBadges.push(BADGES.FIRST_LESSON);
      }

      // Category-specific badges for exercises/lessons
      if (data.category === 'recycling' && !currentBadges.includes(BADGES.RECYCLE_MASTER)) {
        const recycleActivities = progress.filter(
          p => p.status === 'completed' && (p.game?.category === 'recycling' || p.lesson?.category === 'recycling')
        ).length;
        if (recycleActivities >= 5) {
          newBadges.push(BADGES.RECYCLE_MASTER);
        }
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
      if (completedGames === 1 && !currentBadges.includes(BADGES.FIRST_GAME)) {
        newBadges.push(BADGES.FIRST_GAME);
      }

      // Category-specific badges with improved detection
      const checkCategoryBadge = (category, badge) => {
        if (data.category === category && !currentBadges.includes(badge)) {
          // Count progress across all activities for this user
          const catCount = progress.filter(p => {
            const isCompleted = p.status === 'completed';
            // Match legacy category if populated
            const matchesLegacy = p.game?.category === category || p.lesson?.category === category;
            // Match current activity category (passed via data)
            const matchesCurrent = p.courseSection && (p.courseSection === 'game' || p.courseSection === 'exercise') &&
              data.category === category &&
              p.status === 'completed';

            return isCompleted && matchesLegacy;
          }).length;

          // Count current session too
          const totalCount = catCount + 1;
          console.log(`🔍 [checkCategoryBadge] Checking ${category}: current count=${catCount}, goal=3`);

          if (totalCount >= 3) {
            return true;
          }
        }
        return false;
      };

      if (checkCategoryBadge('recycling', BADGES.RECYCLE_MASTER)) newBadges.push(BADGES.RECYCLE_MASTER);
      if (checkCategoryBadge('water', BADGES.WATER_SAVER)) newBadges.push(BADGES.WATER_SAVER);
      if (checkCategoryBadge('energy', BADGES.ENERGY_HERO)) newBadges.push(BADGES.ENERGY_HERO);
      if (checkCategoryBadge('climate', BADGES.CLIMATE_CHAMPION)) newBadges.push(BADGES.CLIMATE_CHAMPION);

      // New environmental course badges
      if (checkCategoryBadge('balance', BADGES.BALANCE_SAVIOR)) newBadges.push(BADGES.BALANCE_SAVIOR);
      if (checkCategoryBadge('prevention', BADGES.ISLAND_RESCUER)) newBadges.push(BADGES.ISLAND_RESCUER);
      if (checkCategoryBadge('forest', BADGES.FORREST_GUARDIAN)) newBadges.push(BADGES.FORREST_GUARDIAN);
      if (checkCategoryBadge('solutions', BADGES.ECO_ENGINEER)) newBadges.push(BADGES.ECO_ENGINEER);
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









