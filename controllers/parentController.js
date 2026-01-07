const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const QuizAttempt = require('../models/QuizAttempt');
const Notification = require('../models/Notification');

// Link a student to a parent
exports.linkStudent = async (req, res) => {
    try {
        const { studentIdentifier } = req.body; // Can be username or student ID
        const parentId = req.user.id;

        // Find the student
        const student = await User.findOne({
            $or: [
                { username: studentIdentifier },
                { _id: mongoose.Types.ObjectId.isValid(studentIdentifier) ? studentIdentifier : null }
            ],
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ message: 'التلميذ غير موجود' });
        }

        // Find parent and add student to children if not already linked
        const parent = await User.findById(parentId);
        if (parent.children.includes(student._id)) {
            return res.status(400).json({ message: 'هذا التلميذ مرتبط بالفعل بحسابك' });
        }

        parent.children.push(student._id);
        await parent.save();

        res.json({
            message: 'تم ربط التلميذ بنجاح', student: {
                id: student._id,
                username: student.username,
                profile: student.profile
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
};

// Get all linked students for a parent
exports.getLinkedStudents = async (req, res) => {
    try {
        const parent = await User.findById(req.user.id).populate({
            path: 'children',
            select: 'username profile points level gradeLevel badges lastActivity'
        });

        res.json(parent.children);
    } catch (error) {
        res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
};

// Get a specific student's full profile (parent view)
exports.getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const parentId = req.user.id;

        // Verify ownership
        const parent = await User.findById(parentId);
        if (!parent.children.includes(id)) {
            return res.status(403).json({ message: 'غير مصرح لك بعرض بيانات هذا التلميذ' });
        }

        const student = await User.findById(id);
        const progress = await Progress.find({ user: id }).populate('lesson game');
        const quizAttempts = await QuizAttempt.find({ user: id }).populate('quiz');

        // Aggregate data
        const stats = {
            completedLessons: progress.filter(p => p.lesson && p.status === 'completed').length,
            completedGames: progress.filter(p => p.game && p.status === 'completed').length,
            totalPoints: student.points || 0,
            level: student.level || 1,
            badges: student.badges || [],
            quizzes: quizAttempts.map(q => ({
                name: q.quiz?.title,
                score: q.score,
                passed: q.passed,
                timeSpent: q.timeSpent,
                date: q.createdAt
            }))
        };

        res.json({
            student: {
                id: student._id,
                username: student.username,
                profile: student.profile,
                gradeLevel: student.gradeLevel
            },
            stats
        });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
};

const Message = require('../models/Message');

// Get all teachers in the system (for parent messaging)
exports.getTeachers = async (req, res) => {
    try {
        const parentId = req.user.id;
        console.log('[getTeachers] Parent ID:', parentId);

        // Simply get all teachers in the database
        const teachers = await User.find({
            role: 'teacher'
        }).select('username profile role email');

        console.log('[getTeachers] Found', teachers.length, 'teachers in database');
        res.json(teachers);
    } catch (error) {
        console.error('[getTeachers] Error:', error);
        res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
};

// Send a message to a teacher
exports.sendMessage = async (req, res) => {
    try {
        console.log('[Parent sendMessage] Request body:', req.body);
        console.log('[Parent sendMessage] User:', req.user?.id || req.user?._id);

        const { teacherId, message } = req.body;
        const parentId = req.user.id || req.user._id;

        console.log('[Parent sendMessage] Parent ID:', parentId);
        console.log('[Parent sendMessage] Teacher ID:', teacherId);
        console.log('[Parent sendMessage] Message content:', message);

        const newMessage = new Message({
            sender: parentId,
            receiver: teacherId,
            content: message
        });

        console.log('[Parent sendMessage] Message object created:', newMessage);

        const savedMessage = await newMessage.save();
        console.log('[Parent sendMessage] Message saved to DB with ID:', savedMessage._id);

        // Create notification for teacher
        const parent = await User.findById(parentId);
        const parentName = parent.profile?.firstName ? `${parent.profile.firstName} ${parent.profile.lastName}` : parent.username;

        await Notification.create({
            user: teacherId,
            type: 'message',
            title: 'رسالة جديدة من ولي أمر',
            message: `لقد تلقيت رسالة جديدة من ${parentName}`,
            relatedTo: 'message',
            relatedId: savedMessage._id
        });

        console.log('[Parent sendMessage] Notification created for teacher');
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('[Parent sendMessage] Error:', error);
        res.status(500).json({ message: 'خطأ في إرسال الرسالة', error: error.message });
    }
};

// Get messages between parent and a teacher
exports.getMessages = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const parentId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: parentId, receiver: teacherId },
                { sender: teacherId, receiver: parentId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'خطأ في جلب الرسائل', error: error.message });
    }
};
