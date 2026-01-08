const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED'],
        default: 'OPEN'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for fast retrieval and pagination
taskSchema.index({ project: 1, createdAt: -1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
