const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Game = require('../models/Game');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Message = require('../models/Message');

// Helper to get activity model based on type
const getActivityModel = (type) => {
  return type === 'lesson' ? Lesson : Game;
};

// Create a class and generate class code
exports.createClass = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id);

    if (teacher.classCode) {
      return res.status(400).json({
        message: 'You already have a class. Use your existing class code.',
        classCode: teacher.classCode
      });
    }

    // Generate unique class code (6 characters)
    const generateClassCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let classCode = generateClassCode();
    // Ensure uniqueness
    while (await User.findOne({ classCode })) {
      classCode = generateClassCode();
    }

    teacher.classCode = classCode;
    await teacher.save();

    res.json({
      message: 'Class created successfully',
      classCode: classCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign student to class by class code
exports.assignStudentByCode = async (req, res) => {
  try {
    const { classCode } = req.body;
    const { studentId } = req.params;

    const teacher = await User.findById(req.user._id);

    if (!teacher.classCode || teacher.classCode !== classCode) {
      return res.status(403).json({ message: 'Invalid class code' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already assigned
    if (teacher.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already assigned to your class' });
    }

    teacher.students.push(studentId);
    await teacher.save();

    // Update student's classCode
    student.classCode = classCode;
    await student.save();

    // Create notification for student
    await Notification.create({
      user: studentId,
      type: 'teacher_feedback',
      title: 'Welcome to Class!',
      message: `You've been added to ${teacher.username}'s class. Start learning!`,
    });

    res.json({
      message: 'Student assigned successfully',
      student: {
        id: student._id,
        username: student.username,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign student by username (for teachers)
exports.assignStudentByUsername = async (req, res) => {
  try {
    const { username } = req.body;

    const teacher = await User.findById(req.user._id);

    if (!teacher.classCode) {
      return res.status(400).json({ message: 'Please create a class first' });
    }

    const student = await User.findOne({ username, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already assigned
    if (teacher.students.includes(student._id)) {
      return res.status(400).json({ message: 'Student already assigned to your class' });
    }

    teacher.students.push(student._id);
    await teacher.save();

    // Update student's classCode
    student.classCode = teacher.classCode;
    await student.save();

    // Create notification for student
    await Notification.create({
      user: student._id,
      type: 'teacher_feedback',
      title: 'Welcome to Class!',
      message: `You've been added to ${teacher.username}'s class. Start learning!`,
    });

    res.json({
      message: 'Student assigned successfully',
      student: {
        id: student._id,
        username: student.username,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove student from class
exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacher = await User.findById(req.user._id);

    if (!teacher.students.includes(studentId)) {
      return res.status(404).json({ message: 'Student not found in your class' });
    }

    teacher.students = teacher.students.filter(id => id.toString() !== studentId);
    await teacher.save();

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students with detailed progress (Global)
exports.getStudentsWithProgress = async (req, res) => {
  try {
    const { level } = req.query;
    const query = { role: 'student' };
    if (level) {
      query.gradeLevel = parseInt(level);
    }

    const students = await User.find(query);

    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const progress = await Progress.find({ user: student._id })
          .populate('lesson')
          .populate('game');

        const completedLessons = progress.filter(p => p.lesson && p.status === 'completed');
        const completedGames = progress.filter(p => p.game && p.status === 'completed');
        const inProgressLessons = progress.filter(p => p.lesson && p.status === 'in_progress');

        // Get last activity time
        const lastActivity = progress.length > 0
          ? Math.max(...progress.map(p => p.lastAttempt?.getTime() || 0))
          : null;

        // Check if active (activity in last 7 days)
        const isActive = lastActivity
          ? (Date.now() - lastActivity) < (7 * 24 * 60 * 60 * 1000)
          : false;

        return {
          id: student._id,
          username: student.username,
          email: student.email,
          profile: student.profile,
          points: student.points || 0,
          level: student.level || 1,
          gradeLevel: student.gradeLevel,
          badges: student.badges || [],
          stats: {
            completedLessons: completedLessons.length,
            completedGames: completedGames.length,
            inProgressLessons: inProgressLessons.length,
            totalProgress: progress.length
          },
          isActive,
          lastActivity: lastActivity ? new Date(lastActivity) : null
        };
      })
    );

    res.json(studentsWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed student progress
exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Professor has global access to all students now

    const allCourses = await Course.find({ isActive: true }).sort({ gradeLevel: 1, order: 1 });
    const progress = await Progress.find({ user: studentId })
      .populate('course')
      .sort({ createdAt: -1 });

    const courseProgress = allCourses.map(course => {
      const videoProg = progress.find(p => p.course?.toString() === course._id.toString() && p.courseSection === 'video');
      const exercisesProg = progress.filter(p => p.course?.toString() === course._id.toString() && p.courseSection === 'exercise');
      const gamesProg = progress.filter(p => p.course?.toString() === course._id.toString() && p.courseSection === 'game');

      const totalExercises = course.sections?.exercises?.length || 0;
      const totalGames = course.sections?.games?.length || 0;

      const completedExercisesCount = exercisesProg.filter(p => p.status === 'completed').length;
      const completedGamesCount = gamesProg.filter(p => p.status === 'completed').length;
      const videoWatched = videoProg?.status === 'completed';

      // Status calculation
      let status = 'not_started';
      if (videoWatched && completedExercisesCount === totalExercises && completedGamesCount === totalGames) {
        status = 'completed';
      } else if (videoWatched || exercisesProg.length > 0 || gamesProg.length > 0) {
        status = 'in_progress';
      }

      // Progress percentage
      const totalSteps = 1 + totalExercises + totalGames;
      const completedSteps = (videoWatched ? 1 : 0) + completedExercisesCount + completedGamesCount;
      const progressPercent = Math.round((completedSteps / totalSteps) * 100);

      // Last activity for this course
      const courseAttempts = [...(videoProg ? [videoProg] : []), ...exercisesProg, ...gamesProg];
      const lastActivity = courseAttempts.length > 0
        ? new Date(Math.max(...courseAttempts.map(a => a.lastAttempt?.getTime() || a.updatedAt?.getTime() || 0)))
        : null;

      return {
        _id: course._id,
        courseId: course.courseId,
        title: course.title,
        gradeLevel: course.gradeLevel,
        status,
        progressPercent,
        lastActivity,
        stats: {
          totalExercises,
          completedExercises: completedExercisesCount,
          totalGames,
          completedGames: completedGamesCount,
          videoWatched
        }
      };
    });

    const failedItems = progress.filter(p => p.status === 'failed').map(p => ({
      type: p.courseSection,
      sectionId: p.sectionId,
      score: p.score,
      maxScore: p.maxScore,
      at: p.updatedAt
    }));

    res.json({
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        profile: student.profile,
        points: student.points || 0,
        level: student.level || 1,
        gradeLevel: student.gradeLevel,
        badges: student.badges || []
      },
      courseProgress,
      failedItems,
      summary: {
        totalCourses: allCourses.length,
        completedCourses: courseProgress.filter(c => c.status === 'completed').length,
        totalPoints: student.points || 0,
        currentLevel: student.level || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign lesson/game to student(s)
exports.assignActivity = async (req, res) => {
  try {
    const { activityType, activityId, studentIds, deadline, difficulty } = req.body;
    const teacher = await User.findById(req.user._id);

    if (!['lesson', 'game'].includes(activityType)) {
      return res.status(400).json({ message: 'Invalid activity type' });
    }

    // Verify activity exists
    const Activity = activityType === 'lesson' ? Lesson : Game;
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: `${activityType} not found` });
    }

    // Verify all students belong to teacher
    const invalidStudents = studentIds.filter(
      id => !teacher.students.includes(id)
    );
    if (invalidStudents.length > 0) {
      return res.status(403).json({
        message: 'Some students do not belong to your class',
        invalidStudents
      });
    }

    // Create assignments for each student
    const assignments = await Promise.all(
      studentIds.map(async (studentId) => {
        // Check if assignment already exists
        const existing = await Assignment.findOne({
          teacher: teacher._id,
          student: studentId,
          activityType,
          activity: activityId
        });

        if (existing) {
          // Update existing assignment
          existing.deadline = deadline ? new Date(deadline) : null;
          existing.difficulty = difficulty || (activity.difficulty || 'beginner');
          existing.assignedAt = new Date();
          existing.status = 'assigned';
          await existing.save();
          return existing;
        }

        // Create new assignment
        return await Assignment.create({
          teacher: teacher._id,
          student: studentId,
          activityType,
          activity: activityId,
          deadline: deadline ? new Date(deadline) : null,
          difficulty: difficulty || (activity.difficulty || 'beginner'),
          assignedAt: new Date(),
          status: 'assigned'
        });
      })
    );

    // Create notifications for students
    await Promise.all(
      studentIds.map(studentId =>
        Notification.create({
          user: studentId,
          type: 'challenge_reminder',
          title: `New ${activityType} Assigned`,
          message: `Your teacher has assigned: ${activity.title}`,
          relatedTo: activityType,
          relatedId: activityId
        })
      )
    );

    res.json({
      message: `${activityType} assigned successfully`,
      assignments: assignments.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class overview stats (Global)
exports.getClassOverview = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });

    if (students.length === 0) {
      return res.json({
        totalStudents: 0,
        count5eme: 0,
        count6eme: 0,
        activeStudents: 0,
        totalLessonsCompleted: 0,
        totalGamesCompleted: 0,
        avgPoints5eme: 0,
        avgPoints6eme: 0,
        totalBadges: 0,
        topLevelSummary: {
          totalPoints: 0,
          participationRate: 0
        }
      });
    }

    const students5eme = students.filter(s => s.gradeLevel === 5);
    const students6eme = students.filter(s => s.gradeLevel === 6);

    // Get all progress for all students
    const allProgress = await Progress.find({
      user: { $in: students.map(s => s._id) }
    }).populate('lesson').populate('game');

    // Calculate active students (activity in last 24h for "today", but we'll use 24h)
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const activeStudentIds = new Set(
      allProgress
        .filter(p => p.lastAttempt && p.lastAttempt.getTime() > twentyFourHoursAgo)
        .map(p => p.user.toString())
    );

    const totalLessonsCompleted = allProgress.filter(
      p => p.lesson && p.status === 'completed'
    ).length;

    const totalGamesCompleted = allProgress.filter(
      p => p.game && p.status === 'completed'
    ).length;

    const totalPoints = students.reduce((sum, s) => sum + (s.points || 0), 0);
    const avgPoints5eme = students5eme.length > 0 ? Math.round(students5eme.reduce((sum, s) => sum + (s.points || 0), 0) / students5eme.length) : 0;
    const avgPoints6eme = students6eme.length > 0 ? Math.round(students6eme.reduce((sum, s) => sum + (s.points || 0), 0) / students6eme.length) : 0;
    const totalBadges = students.reduce((sum, s) => sum + (s.badges?.length || 0), 0);

    res.json({
      totalStudents: students.length,
      count5eme: students5eme.length,
      count6eme: students6eme.length,
      activeStudents: activeStudentIds.size,
      totalLessonsCompleted,
      totalGamesCompleted,
      avgPoints5eme,
      avgPoints6eme,
      totalBadges,
      topLevelSummary: {
        totalPoints: totalPoints,
        participationRate: students.length > 0 ? Math.round((activeStudentIds.size / students.length) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /students/:id/full-profile
exports.getStudentFullProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const allCourses = await Course.find({ isActive: true }).sort({ gradeLevel: 1, order: 1 });
    const progress = await Progress.find({ user: studentId }).populate('course').populate('lesson').populate('game');
    const quizAttempts = await QuizAttempt.find({ user: studentId }).populate('quiz');

    // Lesson Details
    const lessons = progress.filter(p => p.lesson).map(p => ({
      id: p.lesson._id,
      title: p.lesson.title,
      status: p.status,
      completedAt: p.updatedAt,
      points: p.score || 0
    }));

    // Game Details
    const games = progress.filter(p => p.game).map(p => ({
      id: p.game._id,
      title: p.game.title,
      status: p.status,
      points: p.score || 0,
      playedAt: p.updatedAt
    }));

    // Logic for course progress percentage
    const courseStats = allCourses.map(course => {
      const courseProg = progress.filter(p => p.course?.toString() === course._id.toString());
      const totalItems = 1 + (course.sections?.exercises?.length || 0) + (course.sections?.games?.length || 0);
      const completedItems = courseProg.filter(p => p.status === 'completed').length;
      return {
        id: course._id,
        title: course.title,
        percentage: Math.round((completedItems / totalItems) * 100),
        isLocked: student.lockedCourses.includes(course._id)
      };
    });

    res.json({
      identity: {
        username: student.username,
        fullName: `${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.trim() || student.username,
        avatar: student.profile?.avatar,
        gradeLevel: student.gradeLevel,
        points: student.points,
        badges: student.badges,
        internalNotes: student.internalNotes
      },
      academicProgress: {
        lessons,
        courseStats,
        completedCoursesCount: courseStats.filter(c => c.percentage === 100).length
      },
      games,
      quizzes: quizAttempts.map(a => ({
        id: a._id,
        quizTitle: a.quiz?.title || 'Unknown Quiz',
        score: a.score,
        percentage: a.percentage,
        status: a.status,
        timeSpent: a.timeSpent,
        date: a.attemptedAt
      })),
      badges: student.badges.map(b => ({ id: b, earned: true })) // Logic for locked badges will be on frontend
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /students/:id/reset-progress
exports.resetStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    await Progress.deleteMany({ user: studentId });
    await QuizAttempt.deleteMany({ user: studentId });
    await User.findByIdAndUpdate(studentId, { points: 0, level: 1, badges: [] });
    res.json({ message: 'Progress reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /students/:id/reassign-quiz
exports.reassignQuiz = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { quizId } = req.body;
    await QuizAttempt.deleteMany({ user: studentId, quiz: quizId });
    res.json({ message: 'Quiz reassigned (attempts cleared)' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /students/:id/notes
exports.addStudentNote = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { text } = req.body;
    await User.findByIdAndUpdate(studentId, {
      $push: { internalNotes: { text, createdAt: new Date() } }
    });
    res.json({ message: 'Note added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /students/:id/badges/:badgeId
exports.removeStudentBadge = async (req, res) => {
  try {
    const { studentId, badgeId } = req.params;
    await User.findByIdAndUpdate(studentId, {
      $pull: { badges: badgeId }
    });
    res.json({ message: 'Badge removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /students/:id/toggle-course
exports.toggleCourseAccess = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.body;
    const student = await User.findById(studentId);
    const isLocked = student.lockedCourses.includes(courseId);

    if (isLocked) {
      await User.findByIdAndUpdate(studentId, { $pull: { lockedCourses: courseId } });
    } else {
      await User.findByIdAndUpdate(studentId, { $push: { lockedCourses: courseId } });
    }

    res.json({ message: isLocked ? 'Course unlocked' : 'Course locked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get all parents in the system (for teacher messaging)
exports.getParents = async (req, res) => {
  try {
    const teacherId = req.user._id;
    console.log('[getParents] Teacher ID:', teacherId);

    // Simply get all parents in the database
    const parents = await User.find({
      role: 'parent'
    }).select('username profile role email');

    console.log('[getParents] Found', parents.length, 'parents in database');
    res.json(parents);
  } catch (error) {
    console.error('[getParents] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for teacher
exports.getMessages = async (req, res) => {
  try {
    const { parentId } = req.params;
    const teacherId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: teacherId, receiver: parentId },
        { sender: parentId, receiver: teacherId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message to parent
exports.sendMessage = async (req, res) => {
  try {
    console.log('[Teacher sendMessage] Request body:', req.body);
    console.log('[Teacher sendMessage] Teacher ID:', req.user._id);

    const { parentId, message } = req.body;
    const teacherId = req.user._id;

    console.log('[Teacher sendMessage] Sending to parent:', parentId);
    console.log('[Teacher sendMessage] Message content:', message);

    const newMessage = new Message({
      sender: teacherId,
      receiver: parentId,
      content: message
    });

    const savedMessage = await newMessage.save();
    console.log('[Teacher sendMessage] Message saved with ID:', savedMessage._id);

    // Create notification for parent
    const teacher = await User.findById(teacherId);
    const teacherName = teacher.profile?.firstName ? `${teacher.profile.firstName} ${teacher.profile.lastName}` : teacher.username;

    await Notification.create({
      user: parentId,
      type: 'message',
      title: 'New message from teacher',
      message: `You have received a new message from ${teacherName}`,
      relatedTo: 'message',
      relatedId: savedMessage._id
    });

    console.log('[Teacher sendMessage] Notification created');
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('[Teacher sendMessage] Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
