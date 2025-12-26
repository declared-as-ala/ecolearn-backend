const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Game = require('../models/Game');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');

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

// Get all students with detailed progress
exports.getStudentsWithProgress = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate('students');
    const students = teacher.students || [];

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
    const teacher = await User.findById(req.user._id);

    if (!teacher.students.includes(studentId)) {
      return res.status(403).json({ message: 'You do not have access to this student' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const progress = await Progress.find({ user: studentId })
      .populate('lesson')
      .populate('game')
      .sort({ createdAt: -1 });

    const lessons = await Lesson.find({ isActive: true });
    const games = await Game.find({ isActive: true });

    const lessonProgress = lessons.map(lesson => {
      const prog = progress.find(p => p.lesson && p.lesson._id.toString() === lesson._id.toString());
      return {
        lesson: {
          _id: lesson._id,
          title: lesson.title,
          category: lesson.category,
          difficulty: lesson.difficulty,
          points: lesson.points
        },
        status: prog?.status || 'not_started',
        score: prog?.score || 0,
        timeSpent: prog?.timeSpent || 0,
        completedAt: prog?.completedAt || null,
        attempts: prog?.attempts || 0
      };
    });

    const gameProgress = games.map(game => {
      const prog = progress.find(p => p.game && p.game._id.toString() === game._id.toString());
      return {
        game: {
          _id: game._id,
          title: game.title,
          type: game.type,
          category: game.category,
          difficulty: game.difficulty,
          points: game.points
        },
        status: prog?.status || 'not_started',
        score: prog?.score || 0,
        maxScore: prog?.maxScore || 0,
        completedAt: prog?.completedAt || null,
        attempts: prog?.attempts || 0,
        behavioralPatterns: prog?.behavioralPatterns || []
      };
    });

    // Calculate behavioral indicators
    const behavioralPatterns = progress
      .filter(p => p.behavioralPatterns && p.behavioralPatterns.length > 0)
      .flatMap(p => p.behavioralPatterns);

    const positiveBehaviors = behavioralPatterns.filter(b => b.type === 'positive').length;
    const negativeBehaviors = behavioralPatterns.filter(b => b.type === 'negative').length;

    res.json({
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        profile: student.profile,
        points: student.points || 0,
        level: student.level || 1,
        badges: student.badges || []
      },
      lessonProgress,
      gameProgress,
      behavioralIndicators: {
        positive: positiveBehaviors,
        negative: negativeBehaviors,
        total: behavioralPatterns.length
      },
      summary: {
        totalLessons: lessons.length,
        completedLessons: lessonProgress.filter(l => l.status === 'completed').length,
        totalGames: games.length,
        completedGames: gameProgress.filter(g => g.status === 'completed').length,
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

// Get class overview stats
exports.getClassOverview = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate('students');
    const students = teacher.students || [];

    if (students.length === 0) {
      return res.json({
        totalStudents: 0,
        activeStudents: 0,
        averageLevel: 0,
        totalLessonsCompleted: 0,
        totalGamesCompleted: 0,
        averagePoints: 0,
        classCode: teacher.classCode || null
      });
    }

    // Get all progress for all students
    const allProgress = await Progress.find({
      user: { $in: students.map(s => s._id) }
    }).populate('lesson').populate('game');

    // Calculate active students (activity in last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const activeStudentIds = new Set(
      allProgress
        .filter(p => p.lastAttempt && p.lastAttempt.getTime() > sevenDaysAgo)
        .map(p => p.user.toString())
    );

    const totalLessonsCompleted = allProgress.filter(
      p => p.lesson && p.status === 'completed'
    ).length;

    const totalGamesCompleted = allProgress.filter(
      p => p.game && p.status === 'completed'
    ).length;

    const totalPoints = students.reduce((sum, s) => sum + (s.points || 0), 0);
    const totalLevels = students.reduce((sum, s) => sum + (s.level || 1), 0);

    res.json({
      totalStudents: students.length,
      activeStudents: activeStudentIds.size,
      averageLevel: Math.round((totalLevels / students.length) * 10) / 10,
      totalLessonsCompleted,
      totalGamesCompleted,
      averagePoints: Math.round((totalPoints / students.length) * 10) / 10,
      classCode: teacher.classCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

