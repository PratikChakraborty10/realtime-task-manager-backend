const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
        default: 'ACTIVE'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for fast retrieval
projectSchema.index({ createdBy: 1, createdAt: -1 });
projectSchema.index({ members: 1, createdAt: -1 });

// Text index for search
projectSchema.index({ name: 'text', description: 'text' });

// Soft delete middleware - exclude deleted records from all find queries
projectSchema.pre(/^find/, function () {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Project', projectSchema);

