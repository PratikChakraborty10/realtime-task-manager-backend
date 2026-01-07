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
    }
}, {
    timestamps: true
});

projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);
