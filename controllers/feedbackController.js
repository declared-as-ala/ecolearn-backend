const User = require('../models/User');
const Notification = require('../models/Notification');
const Progress = require('../models/Progress');

// Send feedback to student
exports.sendFeedback = async (req, res) => {
  try {
    const { studentId, message, type } = req.body;

    // Verify teacher has access to this student
    const teacher = await User.findById(req.user._id);
    if (!teacher.students.includes(studentId)) {
      return res.status(403).json({ message: 'You do not have access to this student' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create notification
    const notification = await Notification.create({
      user: studentId,
      type: 'teacher_feedback',
      title: 'Feedback from Teacher',
      message: message || 'Your teacher has sent you feedback.',
      relatedTo: 'feedback',
    });

    res.json({ message: 'Feedback sent successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send feedback to multiple students
exports.sendFeedbackToMultiple = async (req, res) => {
  try {
    const { studentIds, message } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one student' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a feedback message' });
    }

    // Verify teacher has access to all students
    const teacher = await User.findById(req.user._id);
    const invalidStudents = studentIds.filter(id => !teacher.students.includes(id));
    if (invalidStudents.length > 0) {
      return res.status(403).json({ message: 'You do not have access to some selected students' });
    }

    // Create notifications for all students
    const notifications = await Promise.all(
      studentIds.map(studentId =>
        Notification.create({
          user: studentId,
          type: 'teacher_feedback',
          title: 'Feedback from Teacher',
          message: message.trim(),
          relatedTo: 'feedback',
        })
      )
    );

    res.json({ message: `Feedback sent successfully to ${notifications.length} student(s)`, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send general notification to entire class
exports.sendClassNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a notification message' });
    }

    const teacher = await User.findById(req.user._id).populate('students');
    const students = teacher.students || [];

    if (students.length === 0) {
      return res.status(400).json({ message: 'You have no students in your class' });
    }

    // Create notifications for all students
    const notifications = await Promise.all(
      students.map(student =>
        Notification.create({
          user: student._id,
          type: 'teacher_feedback',
          title: title || 'Class Announcement',
          message: message.trim(),
          relatedTo: 'class',
        })
      )
    );

    res.json({ 
      message: `Notification sent successfully to ${notifications.length} student(s)`, 
      notifications 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student behavioral patterns
exports.getBehavioralPatterns = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify teacher has access
    const teacher = await User.findById(req.user._id);
    if (!teacher.students.includes(studentId)) {
      return res.status(403).json({ message: 'You do not have access to this student' });
    }

    const progress = await Progress.find({ user: studentId })
      .select('behavioralPatterns game lesson status')
      .populate('game', 'title category type')
      .populate('lesson', 'title category');

    const patterns = progress
      .filter(p => p.behavioralPatterns && p.behavioralPatterns.length > 0)
      .flatMap(p => p.behavioralPatterns.map(pattern => ({
        ...pattern.toObject(),
        game: p.game,
        lesson: p.lesson,
      })));

    const positiveCount = patterns.filter(p => p.type === 'positive').length;
    const negativeCount = patterns.filter(p => p.type === 'negative').length;

    res.json({
      patterns,
      summary: {
        positive: positiveCount,
        negative: negativeCount,
        total: patterns.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate class report (CSV format)
exports.generateReport = async (req, res) => {
  try {
    const { format } = req.query; // 'csv' or 'json'
    const teacher = await User.findById(req.user._id).populate('students');
    const students = teacher.students || [];

    const report = await Promise.all(
      students.map(async (student) => {
        const progress = await Progress.find({ user: student._id })
          .populate('lesson')
          .populate('game');
        const completedLessons = progress.filter(p => p.lesson && p.status === 'completed').length;
        const completedGames = progress.filter(p => p.game && p.status === 'completed').length;
        const behavioralPatterns = progress
          .filter(p => p.behavioralPatterns && p.behavioralPatterns.length > 0)
          .flatMap(p => p.behavioralPatterns);

        return {
          student: {
            id: student._id,
            username: student.username,
            email: student.email,
          },
          stats: {
            points: student.points || 0,
            level: student.level || 1,
            badges: student.badges || [],
            completedLessons,
            completedGames,
            positiveBehaviors: behavioralPatterns.filter(p => p.type === 'positive').length,
            negativeBehaviors: behavioralPatterns.filter(p => p.type === 'negative').length,
          }
        };
      })
    );

    const reportData = {
      classCode: teacher.classCode,
      totalStudents: students.length,
      students: report,
      generatedAt: new Date()
    };

    if (format === 'csv') {
      // Generate CSV with proper escaping
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const headers = ['Student Name', 'Email', 'Level', 'Points', 'Lessons Completed', 'Games Completed', 'Badges', 'Positive Behaviors', 'Negative Behaviors'];
      const rows = report.map(r => [
        r.student.username,
        r.student.email,
        r.stats.level,
        r.stats.points,
        r.stats.completedLessons,
        r.stats.completedGames,
        r.stats.badges.length,
        r.stats.positiveBehaviors,
        r.stats.negativeBehaviors
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => escapeCSV(cell)).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=class-report-${teacher.classCode || 'report'}-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      // Return JSON
      res.json(reportData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

