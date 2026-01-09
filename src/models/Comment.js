const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
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

// Index for pagination (oldest first)
commentSchema.index({ task: 1, createdAt: 1 });

// Text index for search
commentSchema.index({ content: 'text' });

// Soft delete middleware
commentSchema.pre(/^find/, function () {
    this.where({ deletedAt: null });
});

module.exports = mongoose.model('Comment', commentSchema);

