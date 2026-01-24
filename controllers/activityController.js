const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const TreePlanting = require('../models/TreePlanting');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const Progress = require('../models/Progress');

// Get activity by ID
exports.getActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all activities (optionally filtered by type)
exports.getAllActivities = async (req, res) => {
    try {
        const { type, gradeLevel } = req.query;
        const filter = { isActive: true };

        if (type) {
            filter.type = type;
        }

        if (gradeLevel) {
            filter.targetGradeLevel = parseInt(gradeLevel);
        }

        const activities = await Activity.find(filter).sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Save or update activity progress
exports.saveProgress = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { userId, currentScreen, progressData } = req.body;

        // Find or create progress record
        let progress = await Progress.findOne({
            user: userId,
            sectionId: activityId,
            courseSection: 'activity'
        });

        if (!progress) {
            progress = new Progress({
                user: userId,
                sectionId: activityId,
                courseSection: 'activity',
                status: 'in_progress'
            });
        }

        // Update progress data
        progress.answers = progressData || [];
        progress.lastAttempt = Date.now();

        await progress.save();

        res.json({ message: 'Progress saved', progress });
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Submit tree planting activity
exports.submitTreePlanting = async (req, res) => {
    try {
        const {
            userId,
            activityId,
            studentName,
            treeType,
            plantingDate,
            school,
            plantingLocation,
            plantingLocationArabic,
            assignedRole,
            assignedRoleArabic,
            waterAmount,
            documentationNote,
            documentationEmoji,
            careInitiatives,
            careInitiativesArabic,
            reflectionResponses
        } = req.body;

        // Create tree planting record
        // Only set activity field if it's a valid ObjectId, otherwise leave it undefined
        const treePlantingData = {
            user: userId,
            studentName,
            treeType,
            plantingDate: plantingDate || Date.now(),
            school,
            plantingLocation,
            plantingLocationArabic,
            assignedRole,
            assignedRoleArabic,
            soilPrepCompleted: true,
            plantingCompleted: true,
            wateringCompleted: true,
            waterAmount,
            documentationNote,
            documentationEmoji,
            careInitiatives: careInitiatives || [],
            careInitiativesArabic: careInitiativesArabic || [],
            reflectionResponses,
            completed: true,
            completedAt: Date.now()
        };

        // Only set activity if it's a valid ObjectId
        if (activityId && mongoose.Types.ObjectId.isValid(activityId)) {
            treePlantingData.activity = activityId;
        }

        const treePlanting = new TreePlanting(treePlantingData);

        // Get activity to determine rewards (only if activityId is a valid ObjectId)
        let activity = null;
        if (activityId && mongoose.Types.ObjectId.isValid(activityId)) {
            try {
                activity = await Activity.findById(activityId);
            } catch (err) {
                console.log('Activity lookup skipped (not a valid ObjectId):', activityId);
            }
        }

        // Set default rewards if activity not found
        treePlanting.pointsEarned = activity?.pointsReward || 100;
        treePlanting.badgesEarned = activity?.badges || ['🌳 حامي الطبيعة'];

        // Update user points and badges
        const user = await User.findById(userId);
        if (user) {
            user.points = (user.points || 0) + treePlanting.pointsEarned;

            // Add unique badges
            if (treePlanting.badgesEarned && treePlanting.badgesEarned.length > 0) {
                if (!user.badges) {
                    user.badges = [];
                }
                treePlanting.badgesEarned.forEach(badge => {
                    if (!user.badges.includes(badge)) {
                        user.badges.push(badge);
                    }
                });
            }

            await user.save();
        }

        await treePlanting.save();

        // Update progress to completed
        await Progress.findOneAndUpdate(
            {
                user: userId,
                sectionId: activityId,
                courseSection: 'activity'
            },
            {
                status: 'completed',
                completedAt: Date.now(),
                score: treePlanting.pointsEarned
            },
            { upsert: true }
        );

        res.status(201).json({
            message: 'Tree planting activity submitted successfully',
            treePlanting,
            pointsEarned: treePlanting.pointsEarned,
            badgesEarned: treePlanting.badgesEarned
        });
    } catch (error) {
        console.error('Error submitting tree planting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get student's planted trees
exports.getMyTrees = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const trees = await TreePlanting.find({ user: userId })
            .populate('activity', 'titleArabic type')
            .sort({ createdAt: -1 });

        res.json(trees);
    } catch (error) {
        console.error('Error fetching trees:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Submit teacher evaluation
exports.submitEvaluation = async (req, res) => {
    try {
        const {
            treePlantingId,
            teacherId,
            activeParticipation,
            roleCommitment,
            responsibility,
            teamwork,
            safetyRespect,
            comments
        } = req.body;

        const treePlanting = await TreePlanting.findById(treePlantingId);

        if (!treePlanting) {
            return res.status(404).json({ message: 'Tree planting record not found' });
        }

        // Update teacher evaluation
        treePlanting.teacherEvaluation = {
            teacherId,
            activeParticipation,
            roleCommitment,
            responsibility,
            teamwork,
            safetyRespect,
            evaluatedAt: Date.now(),
            comments
        };

        await treePlanting.save();

        res.json({
            message: 'Evaluation submitted successfully',
            treePlanting
        });
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get students' tree planting records for a teacher
exports.getStudentRecords = async (req, res) => {
    try {
        const { teacherId } = req.query;

        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        // Get teacher's students
        const teacher = await User.findById(teacherId).populate('students');

        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const studentIds = teacher.students.map(s => s._id);

        const records = await TreePlanting.find({ user: { $in: studentIds } })
            .populate('user', 'username profile')
            .populate('activity', 'titleArabic')
            .sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error('Error fetching student records:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Generic helper function to submit activity and award rewards
const submitActivityGeneric = async (req, res, activityType, defaultBadge) => {
    try {
        const { userId, activityId, ...submissionData } = req.body;

        if (!userId || !activityId) {
            return res.status(400).json({ message: 'User ID and Activity ID are required' });
        }

        // Get activity to determine rewards (only if activityId is a valid ObjectId)
        let activity = null;
        if (activityId && mongoose.Types.ObjectId.isValid(activityId)) {
            try {
                activity = await Activity.findById(activityId);
            } catch (err) {
                console.log('Activity lookup skipped (not a valid ObjectId):', activityId);
            }
        }

        // Use activity rewards if found, otherwise use defaults
        const pointsEarned = activity?.pointsReward || 100;
        const badgesEarned = activity?.badges || [defaultBadge];

        // Create activity submission record
        const submissionData_obj = {
            user: userId,
            activityId: activityId,
            activityType: activityType,
            submissionData: submissionData,
            pointsEarned: pointsEarned,
            badgesEarned: badgesEarned,
            completed: true,
            completedAt: Date.now()
        };

        // Only set activity if it's a valid ObjectId
        if (activityId && mongoose.Types.ObjectId.isValid(activityId)) {
            submissionData_obj.activity = activityId;
        }

        const submission = new ActivitySubmission(submissionData_obj);

        await submission.save();

        // Update user points and badges
        const user = await User.findById(userId);
        if (user) {
            user.points = (user.points || 0) + pointsEarned;

            // Add unique badges
            badgesEarned.forEach(badge => {
                if (!user.badges) {
                    user.badges = [];
                }
                if (!user.badges.includes(badge)) {
                    user.badges.push(badge);
                }
            });

            await user.save();
        }

        // Update progress to completed
        await Progress.findOneAndUpdate(
            {
                user: userId,
                sectionId: activityId,
                courseSection: 'activity'
            },
            {
                status: 'completed',
                completedAt: Date.now(),
                score: pointsEarned
            },
            { upsert: true }
        );

        res.status(201).json({
            message: `${activityType} activity submitted successfully`,
            submission,
            pointsEarned: pointsEarned,
            badgesEarned: badgesEarned
        });
    } catch (error) {
        console.error(`Error submitting ${activityType}:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Submit recycled art activity
exports.submitRecycledArt = async (req, res) => {
    return submitActivityGeneric(req, res, 'recycled-art', '🎨 بطل الفن الأخضر');
};

// Submit green cleanliness activity
exports.submitGreenCleanliness = async (req, res) => {
    return submitActivityGeneric(req, res, 'green-cleanliness', '🧹 بطل النظافة الخضراء');
};

// Submit EcoVillage activity
exports.submitEcoVillage = async (req, res) => {
    return submitActivityGeneric(req, res, 'ecovillage', '🏡 باني EcoVillage');
};
