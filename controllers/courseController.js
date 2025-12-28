const mongoose = require('mongoose');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { checkAndAwardBadges } = require('../utils/badges');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { findCourseTemplate } = require('../data/fallbackCourses');

const UNIVERSAL_COURSE_BADGE = '🌍 البطل الشامل للبيئة';
const UNIVERSAL_STUDENT_MESSAGE = 'أنت لم تلعب فقط… بل أنقذت كل كائن وحافظت على التوازن البيئي!';
const UNIVERSAL_PARENT_MESSAGE = 'ولدك أصبح فاعلاً حقيقيًا في حماية الطبيعة! 🌱';

const normalizeId = (id = '') => id.toLowerCase().replace(/_/g, '-');

function buildCourseQuery(id) {
  const normalizedId = normalizeId(id);
  const underscoreId = id.replace(/-/g, '_');
  const normalizedUnderscoreId = normalizedId.replace(/-/g, '_');

  const query = { isActive: true, $or: [] };

  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id }, { courseId: id });
  }

  query.$or.push(
    { courseId: id },
    { courseId: normalizedId },
    { courseId: underscoreId },
    { courseId: normalizedUnderscoreId }
  );

  return query;
}

async function findOrSeedCourse(courseId) {
  const query = buildCourseQuery(courseId);
  let course = await Course.findOne(query);

  if (!course) {
    const template = findCourseTemplate(courseId);
    if (template) {
      course = await Course.findOneAndUpdate(
        { courseId: template.courseId },
        { $setOnInsert: template },
        { upsert: true, new: true }
      );
      console.log(`🌱 [auto-seed] Inserted missing course: ${template.courseId}`);
    }
  }

  return course;
}

async function awardBadgeIfMissing({ userId, badgeName, studentMessage, parentMessage }) {
  if (!badgeName) return [];
  const user = await User.findById(userId);
  if (!user || user.role !== 'student') return [];

  const currentBadges = user.badges || [];
  if (currentBadges.includes(badgeName)) return [];

  user.badges = [...currentBadges, badgeName];
  await user.save();

  // Student notification (Arabic)
  await Notification.create({
    user: userId,
    type: 'badge',
    title: 'شارة جديدة! 🏆',
    message: studentMessage || `تهانينا! حصلت على شارة "${badgeName}"`,
    relatedTo: 'badge',
  });

  // Parent notification (Arabic)
  const parents = await User.find({ children: userId, role: 'parent' });
  for (const parent of parents) {
    await Notification.create({
      user: parent._id,
      type: 'parent_alert',
      title: 'إنجاز جديد للطفل! 🌱',
      message: parentMessage || UNIVERSAL_PARENT_MESSAGE,
      relatedTo: 'badge',
    });
  }

  return [badgeName];
}

async function maybeAwardCourseCompletionBadge(userId, courseDoc) {
  try {
    if (!courseDoc?.badge?.name) return [];

    const totalExercises = courseDoc.sections?.exercises?.length || 0;
    const totalGames = courseDoc.sections?.games?.length || 0;

    const videoProgress = await Progress.findOne({
      user: userId,
      course: courseDoc._id,
      courseSection: 'video'
    });
    const exercisesCompleted = await Progress.find({
      user: userId,
      course: courseDoc._id,
      courseSection: 'exercise',
      status: 'completed'
    });
    const gamesCompleted = await Progress.find({
      user: userId,
      course: courseDoc._id,
      courseSection: 'game',
      status: 'completed'
    });

    const videoWatched = videoProgress?.status === 'completed';
    const isCourseCompleted =
      videoWatched &&
      exercisesCompleted.length >= totalExercises &&
      gamesCompleted.length >= totalGames;

    if (!isCourseCompleted) return [];

    const courseBadge = await awardBadgeIfMissing({
      userId,
      badgeName: courseDoc.badge.name,
      studentMessage: UNIVERSAL_STUDENT_MESSAGE,
      parentMessage: UNIVERSAL_PARENT_MESSAGE,
    });
    const universalBadge = await awardBadgeIfMissing({
      userId,
      badgeName: UNIVERSAL_COURSE_BADGE,
      studentMessage: UNIVERSAL_STUDENT_MESSAGE,
      parentMessage: UNIVERSAL_PARENT_MESSAGE,
    });

    return [...courseBadge, ...universalBadge];
  } catch (e) {
    console.error('❌ [maybeAwardCourseCompletionBadge] Error:', e);
    return [];
  }
}

// Get all courses for a grade level
exports.getCourses = async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    const userId = req.user?._id;

    if (!gradeLevel || (gradeLevel !== '5' && gradeLevel !== '6')) {
      return res.status(400).json({ message: 'Valid gradeLevel (5 or 6) is required' });
    }

    const courses = await Course.find({
      gradeLevel: parseInt(gradeLevel),
      isActive: true
    }).sort({ order: 1 });

    // Get user progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        let progress = null;
        if (userId) {
          const courseProgress = await Progress.findOne({
            user: userId,
            course: course._id,
            courseSection: 'video'
          });

          const exercisesProgress = await Progress.find({
            user: userId,
            course: course._id,
            courseSection: 'exercise'
          });

          const gamesProgress = await Progress.find({
            user: userId,
            course: course._id,
            courseSection: 'game'
          });

          const videoWatched = courseProgress?.status === 'completed';
          const completedExercises = exercisesProgress.filter(p => p.status === 'completed').length;
          const completedGames = gamesProgress.filter(p => p.status === 'completed').length;

          const totalExercises = course.sections?.exercises?.length || 0;
          const totalGames = course.sections?.games?.length || 0;

          const progressPercent = totalExercises + totalGames > 0
            ? Math.round(((videoWatched ? 1 : 0) + completedExercises + completedGames) / (1 + totalExercises + totalGames) * 100)
            : (videoWatched ? 100 : 0);

          progress = {
            videoWatched,
            completedExercises,
            completedGames,
            totalExercises,
            totalGames,
            progressPercent,
            completed: progressPercent === 100
          };
        }

        return {
          ...course.toObject(),
          progress
        };
      })
    );

    res.json(coursesWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single course by ID or Slug
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    console.log(`🔍 [getCourseById] Searching for course: ${id}`);

    const course = await findOrSeedCourse(id);

    if (!course) {
      console.warn(`❌ [getCourseById] Course NOT found in database: ${id}`);
      return res.status(404).json({ 
        message: 'Course not found',
        suggestion: 'Ensure the database has been seeded with "node seedEnvironmental.js"'
      });
    }

    console.log(`✅ [getCourseById] Found course: ${course.title} (${course.courseId})`);

    // Get user progress
    let progress = null;
    if (userId) {
      const videoProgress = await Progress.findOne({
        user: userId,
        course: course._id,
        courseSection: 'video'
      });

      const exercisesProgress = await Progress.find({
        user: userId,
        course: course._id,
        courseSection: 'exercise'
      });

      const gamesProgress = await Progress.find({
        user: userId,
        course: course._id,
        courseSection: 'game'
      });

      const videoWatched = videoProgress?.status === 'completed';
      const exercisesStatus = exercisesProgress.reduce((acc, p) => {
        acc[p.sectionId] = {
          status: p.status,
          score: p.score,
          maxScore: p.maxScore
        };
        return acc;
      }, {});

      const gamesStatus = gamesProgress.reduce((acc, p) => {
        acc[p.sectionId] = {
          status: p.status,
          score: p.score,
          maxScore: p.maxScore
        };
        return acc;
      }, {});

      const totalPoints = exercisesProgress
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.score || 0), 0) +
        gamesProgress
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.score || 0), 0);

      progress = {
        videoWatched,
        exercisesStatus,
        gamesStatus,
        totalPoints,
        videoProgress: videoProgress ? {
          status: videoProgress.status,
          timeSpent: videoProgress.timeSpent,
          completedAt: videoProgress.completedAt
        } : null
      };
    }

    res.json({
      ...course.toObject(),
      progress
    });
  } catch (error) {
    console.error('❌ [getCourseById] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark video as watched
exports.watchVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeSpent } = req.body;
    const userId = req.user._id;

    console.log(`🎬 [watchVideo] Marking video as watched for course ${courseId}`);

    const course = await findOrSeedCourse(courseId);

    if (!course) {
      console.error(`❌ [watchVideo] Course NOT found: ${courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update or create progress
    let progress = await Progress.findOne({
      user: userId,
      course: course._id,
      courseSection: 'video'
    });

    if (!progress) {
      progress = new Progress({
        user: userId,
        course: course._id,
        courseSection: 'video',
        status: 'completed',
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      });
    } else {
      progress.status = 'completed';
      progress.timeSpent = timeSpent || progress.timeSpent;
      progress.completedAt = new Date();
    }

    await progress.save();

    const courseBadges = await maybeAwardCourseCompletionBadge(userId, course);
    res.json({ message: 'Video marked as watched', progress, badges: courseBadges });
  } catch (error) {
    console.error('❌ [watchVideo] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit exercise
exports.submitExercise = async (req, res) => {
  try {
    const { courseId, exerciseId } = req.params;
    const { answers, score, maxScore } = req.body;
    const userId = req.user._id;

    console.log(`📝 [submitExercise] Submitting exercise ${exerciseId} for course ${courseId}`);

    const course = await findOrSeedCourse(courseId);

    if (!course) {
      console.error(`❌ [submitExercise] Course NOT found: ${courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }

    const normalizedExerciseId = exerciseId.toLowerCase().replace(/_/g, '-');
    const exercise = course.sections?.exercises?.find(e => 
      e.id === exerciseId || e.id === normalizedExerciseId || e.id?.toLowerCase() === normalizedExerciseId
    );
    if (!exercise) {
      console.error(`❌ [submitExercise] Exercise NOT found in course ${courseId}: ${exerciseId}`);
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Update or create progress
    let progress = await Progress.findOne({
      user: userId,
      course: course._id,
      courseSection: 'exercise',
      sectionId: exerciseId
    });

    const wasAlreadyCompleted = progress && progress.status === 'completed';
    const isCompleted = score >= (maxScore * 0.7); // 70% to pass

    if (!progress) {
      progress = new Progress({
        user: userId,
        course: course._id,
        courseSection: 'exercise',
        sectionId: exerciseId,
        status: isCompleted ? 'completed' : 'failed',
        score: score || 0,
        maxScore: maxScore || exercise.points,
        attempts: 1,
        answers: answers || [],
        completedAt: isCompleted ? new Date() : null
      });
    } else {
      progress.attempts += 1;
      progress.score = score || progress.score;
      progress.maxScore = maxScore || progress.maxScore;
      progress.status = isCompleted ? 'completed' : 'failed';
      progress.answers = answers || progress.answers;
      if (isCompleted && !progress.completedAt) {
        progress.completedAt = new Date();
      }
    }

    await progress.save();

    let newBadges = [];

    // Update user points if completed and not already completed before
    if (isCompleted && !wasAlreadyCompleted) {
      const user = await User.findById(userId);
      if (user) {
        const oldLevel = user.level || 0;
        const awardedPoints = exercise.points || 10;
        user.points = (user.points || 0) + awardedPoints;

        // Recalculate level
        if (typeof user.calculateLevel === 'function') {
          user.level = user.calculateLevel();
        } else {
          user.level = Math.floor(user.points / 100) + 1;
        }

        await user.save();
        console.log(`💰 [submitExercise] Points awarded: ${awardedPoints}, Total: ${user.points} for user ${userId}`);

        newBadges = await checkAndAwardBadges(userId, 'exercise_completed', {
          score,
          maxScore,
          category: course.courseId === 'climatic-factors' ? 'climate' :
            course.courseId === 'eco-balance' ? 'balance' :
              course.courseId === 'imbalance-causes' || course.courseId === 'imbalance-causes-extended' ? 'prevention' :
                course.courseId === 'human-role' ? 'solutions' :
                  course.category || exercise.type
        });

        // Perfectionist badge
        if (score === maxScore) {
          const perfectionBadge = await checkAndAwardBadges(userId, 'perfect_score', { score, maxScore });
          newBadges = [...newBadges, ...perfectionBadge];
        }

        // First lesson/exercise badge
        const allProgress = await Progress.find({ user: userId, status: 'completed' });
        if (allProgress.length === 1) {
          const firstSteps = await checkAndAwardBadges(userId, 'first_lesson');
          newBadges = [...newBadges, ...firstSteps];
        }

        // Check for level up notification
        if (user.level > oldLevel) {
          await Notification.create({
            user: userId,
            type: 'level_up',
            title: 'Level Up!',
            message: `تهانينا! وصلت إلى المستوى ${user.level}!`,
            relatedTo: 'level'
          });
        }
      }
    }

    // Award per-exercise badge if defined in course content
    if (isCompleted && !wasAlreadyCompleted) {
      const badgeName = exercise?.content?.rewardBadgeName || exercise?.content?.rewardBadge?.name;
      const awarded = await awardBadgeIfMissing({
        userId,
        badgeName,
        studentMessage: exercise?.content?.studentMessage || UNIVERSAL_STUDENT_MESSAGE,
        parentMessage: exercise?.content?.parentMessage || UNIVERSAL_PARENT_MESSAGE,
      });
      if (awarded.length > 0) newBadges = [...newBadges, ...awarded];
    }

    // Course completion badge (gold reward per course)
    if (isCompleted) {
      const courseBadge = await maybeAwardCourseCompletionBadge(userId, course);
      if (courseBadge.length > 0) newBadges = [...newBadges, ...courseBadge];
    }

    let updatedUser = null;
    if (isCompleted) {
      updatedUser = await User.findById(userId).select('points level badges username email role profile gradeLevel');
    }

    res.json({
      message: isCompleted ? 'Exercise completed!' : 'Try again!',
      progress,
      passed: isCompleted,
      user: updatedUser,
      badges: newBadges
    });
    console.log(`✅ [submitExercise] Response sent with ${newBadges.length} new badges`);
  } catch (error) {
    console.error('❌ [submitExercise] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit game
exports.submitGame = async (req, res) => {
  try {
    const { courseId, gameId } = req.params;
    const { score, maxScore, results } = req.body;
    const userId = req.user._id;

    console.log(`🎮 [submitGame] Submitting game ${gameId} for course ${courseId}`);

    const course = await findOrSeedCourse(courseId);

    if (!course) {
      console.error(`❌ [submitGame] Course NOT found: ${courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }

    const normalizedGameId = gameId.toLowerCase().replace(/_/g, '-');
    const game = course.sections?.games?.find(g => 
      g.id === gameId || g.id === normalizedGameId || g.id?.toLowerCase() === normalizedGameId
    );
    if (!game) {
      console.error(`❌ [submitGame] Game NOT found in course ${courseId}: ${gameId}`);
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update or create progress
    let progress = await Progress.findOne({
      user: userId,
      course: course._id,
      courseSection: 'game',
      sectionId: gameId
    });

    const wasAlreadyCompleted = progress && progress.status === 'completed';
    const isCompleted = score >= (maxScore * 0.7); // 70% to pass

    if (!progress) {
      progress = new Progress({
        user: userId,
        course: course._id,
        courseSection: 'game',
        sectionId: gameId,
        status: isCompleted ? 'completed' : 'failed',
        score: score || 0,
        maxScore: maxScore || game.points,
        attempts: 1,
        answers: results || [],
        completedAt: isCompleted ? new Date() : null
      });
    } else {
      progress.attempts += 1;
      progress.score = score || progress.score;
      progress.maxScore = maxScore || progress.maxScore;
      progress.status = isCompleted ? 'completed' : 'failed';
      progress.answers = results || progress.answers;
      if (isCompleted && !progress.completedAt) {
        progress.completedAt = new Date();
      }
    }

    await progress.save();

    let newBadges = [];

    // Update user points if completed and not already completed before
    if (isCompleted && !wasAlreadyCompleted) {
      const user = await User.findById(userId);
      if (user) {
        const oldLevel = user.level || 0;
        const awardedPoints = game.points || 20;
        user.points = (user.points || 0) + awardedPoints;

        // Recalculate level
        if (typeof user.calculateLevel === 'function') {
          user.level = user.calculateLevel();
        } else {
          user.level = Math.floor(user.points / 100) + 1;
        }

        await user.save();
        console.log(`🎮 [submitGame] Points awarded: ${awardedPoints}, Total: ${user.points} for user ${userId}`);

        newBadges = await checkAndAwardBadges(userId, 'game_completed', {
          score,
          maxScore,
          category: course.courseId === 'climatic-factors' ? 'climate' :
            course.courseId === 'eco-balance' ? 'balance' :
              course.courseId === 'imbalance-causes' || course.courseId === 'imbalance-causes-extended' ? 'prevention' :
                course.courseId === 'human-role' ? 'solutions' :
                  game.type || 'general'
        });

        // First game badge
        const allGameProgress = await Progress.find({
          user: userId,
          courseSection: 'game',
          status: 'completed'
        });
        if (allGameProgress.length === 1) {
          const gameStarter = await checkAndAwardBadges(userId, 'first_game');
          newBadges = [...newBadges, ...gameStarter];
        }

        // Check for level up
        if (user.level > oldLevel) {
          await Notification.create({
            user: userId,
            type: 'level_up',
            title: 'Level Up!',
            message: `تهانينا! وصلت إلى المستوى ${user.level}!`,
            relatedTo: 'level'
          });
        }
      }
    }

    // Award per-game badge if defined in course content
    if (isCompleted && !wasAlreadyCompleted) {
      const badgeName = game?.gameData?.rewardBadgeName || game?.gameData?.rewardBadge?.name;
      const awarded = await awardBadgeIfMissing({
        userId,
        badgeName,
        studentMessage: game?.gameData?.studentMessage || UNIVERSAL_STUDENT_MESSAGE,
        parentMessage: game?.gameData?.parentMessage || UNIVERSAL_PARENT_MESSAGE,
      });
      if (awarded.length > 0) newBadges = [...newBadges, ...awarded];
    }

    // Course completion badge (gold reward per course)
    if (isCompleted) {
      const courseBadge = await maybeAwardCourseCompletionBadge(userId, course);
      if (courseBadge.length > 0) newBadges = [...newBadges, ...courseBadge];
    }

    let updatedUser = null;
    if (isCompleted) {
      updatedUser = await User.findById(userId).select('points level badges username email role profile gradeLevel');
    }

    res.json({
      message: isCompleted ? 'Game completed!' : 'Try again!',
      progress,
      passed: isCompleted,
      user: updatedUser,
      badges: newBadges
    });
    console.log(`✅ [submitGame] Response sent with ${newBadges.length} new badges`);
  } catch (error) {
    console.error('❌ [submitGame] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

