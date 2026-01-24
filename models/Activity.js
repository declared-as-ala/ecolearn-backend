const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    titleArabic: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    descriptionArabic: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['tree_planting', 'recycling', 'water_conservation', 'energy_saving', 'general'],
        required: true
    },
    targetGradeLevel: {
        type: [Number],
        enum: [5, 6],
        default: [5, 6]
    },
    theme: {
        type: String,
        default: ''
    },
    themeArabic: {
        type: String,
        default: ''
    },
    // Screen configurations for the activity
    screens: [{
        screenNumber: {
            type: Number,
            required: true
        },
        screenType: {
            type: String,
            enum: ['welcome', 'quote', 'goals', 'interactive', 'game', 'form', 'reflection', 'completion'],
            required: true
        },
        title: String,
        titleArabic: String,
        content: mongoose.Schema.Types.Mixed, // Flexible content structure
        interactionType: {
            type: String,
            enum: ['none', 'tap', 'drag_drop', 'select', 'form', 'slider', 'checklist']
        }
    }],
    // Rewards
    pointsReward: {
        type: Number,
        default: 100
    },
    badges: [{
        type: String
    }],
    // Completion tracking
    estimatedDuration: {
        type: Number, // in minutes
        default: 30
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
activitySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Activity', activitySchema);
