const mongoose = require('mongoose');

const activitySubmissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: true
    },
    activityId: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        enum: ['tree-planting', 'recycled-art', 'green-cleanliness', 'ecovillage'],
        required: true
    },
    // Flexible data storage for all activity types
    submissionData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    pointsEarned: {
        type: Number,
        default: 100
    },
    badgesEarned: [{
        type: String
    }],
    completed: {
        type: Boolean,
        default: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
activitySubmissionSchema.index({ user: 1, activityId: 1 });
activitySubmissionSchema.index({ user: 1, activityType: 1 });

module.exports = mongoose.model('ActivitySubmission', activitySubmissionSchema);
