const mongoose = require('mongoose');

const treePlantingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: false  // Made optional to support string activityId values
    },
    // Student-provided information
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    treeType: {
        type: String,
        required: true,
        trim: true
    },
    plantingDate: {
        type: Date,
        required: true
    },
    school: {
        type: String,
        required: true,
        trim: true
    },
    // Planning phase data
    plantingLocation: {
        type: String,
        enum: ['school_yard', 'garden', 'perimeter'],
        required: true
    },
    plantingLocationArabic: {
        type: String,
        required: true
    },
    assignedRole: {
        type: String,
        enum: ['digging', 'planting', 'watering', 'documenting'],
        required: true
    },
    assignedRoleArabic: {
        type: String,
        required: true
    },
    // Activity completion data
    soilPrepCompleted: {
        type: Boolean,
        default: false
    },
    plantingCompleted: {
        type: Boolean,
        default: false
    },
    wateringCompleted: {
        type: Boolean,
        default: false
    },
    waterAmount: {
        type: Number, // 0-100
        default: 0
    },
    // Documentation
    documentationNote: {
        type: String,
        default: ''
    },
    documentationEmoji: {
        type: String,
        default: ''
    },
    // Care initiatives selected by student
    careInitiatives: [{
        type: String,
        enum: ['regular_watering', 'no_branch_breaking', 'protection_sign', 'area_cleaning'],
        required: true
    }],
    careInitiativesArabic: [{
        type: String
    }],
    // Teacher evaluation (behavioral observation grid)
    teacherEvaluation: {
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        activeParticipation: {
            type: String,
            enum: ['always', 'sometimes', 'rarely', 'never'],
            default: null
        },
        roleCommitment: {
            type: String,
            enum: ['always', 'sometimes', 'rarely', 'never'],
            default: null
        },
        responsibility: {
            type: String,
            enum: ['always', 'sometimes', 'rarely', 'never'],
            default: null
        },
        teamwork: {
            type: String,
            enum: ['always', 'sometimes', 'rarely', 'never'],
            default: null
        },
        safetyRespect: {
            type: String,
            enum: ['always', 'sometimes', 'rarely', 'never'],
            default: null
        },
        evaluatedAt: Date,
        comments: String
    },
    // Reflection responses
    reflectionResponses: {
        whyImportant: String,
        behaviorChange: String
    },
    // Progress tracking
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    badgesEarned: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
treePlantingSchema.index({ user: 1, activity: 1 });
treePlantingSchema.index({ user: 1, completed: 1 });

module.exports = mongoose.model('TreePlanting', treePlantingSchema);
