const Course = require('../models/Course');
const Progress = require('../models/Progress');

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

// Get single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const course = await Course.findOne({ 
      $or: [
        { _id: id },
        { courseId: id }
      ],
      isActive: true 
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark video as watched
exports.watchVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeSpent } = req.body;
    const userId = req.user._id;

    const course = await Course.findOne({ 
      $or: [
        { _id: courseId },
        { courseId: courseId }
      ]
    });

    if (!course) {
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

    res.json({ message: 'Video marked as watched', progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit exercise
exports.submitExercise = async (req, res) => {
  try {
    const { courseId, exerciseId } = req.params;
    const { answers, score, maxScore } = req.body;
    const userId = req.user._id;

    const course = await Course.findOne({ 
      $or: [
        { _id: courseId },
        { courseId: courseId }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const exercise = course.sections?.exercises?.find(e => e.id === exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // NO LOCKS - Students can access exercises anytime

    // Update or create progress
    let progress = await Progress.findOne({
      user: userId,
      course: course._id,
      courseSection: 'exercise',
      sectionId: exerciseId
    });

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

    // Update user points if completed (always update, not just first attempt)
    if (isCompleted) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user) {
        const oldLevel = user.level || 0;
        user.points = (user.points || 0) + (exercise.points || 10);
        // Recalculate level
        user.level = Math.floor((user.points || 0) / 100);
        await user.save();
        
        // Check for level up
        if (user.level > oldLevel) {
          const Notification = require('../models/Notification');
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

    res.json({ 
      message: isCompleted ? 'Exercise completed!' : 'Try again!',
      progress,
      passed: isCompleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit game
exports.submitGame = async (req, res) => {
  try {
    const { courseId, gameId } = req.params;
    const { score, maxScore, results } = req.body;
    const userId = req.user._id;

    const course = await Course.findOne({ 
      $or: [
        { _id: courseId },
        { courseId: courseId }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const game = course.sections?.games?.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // NO LOCKS - Students can access games anytime

    // Update or create progress
    let progress = await Progress.findOne({
      user: userId,
      course: course._id,
      courseSection: 'game',
      sectionId: gameId
    });

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

    // Update user points if completed (always update)
    if (isCompleted) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user) {
        const oldLevel = user.level || 0;
        user.points = (user.points || 0) + (game.points || 20);
        // Recalculate level
        user.level = Math.floor((user.points || 0) / 100);
        await user.save();
        
        // Check for level up
        if (user.level > oldLevel) {
          const Notification = require('../models/Notification');
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

    res.json({ 
      message: isCompleted ? 'Game completed!' : 'Try again!',
      progress,
      passed: isCompleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

