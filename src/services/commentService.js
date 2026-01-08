const Comment = require('../models/Comment');

const createComment = async ({ content, task, createdBy }) => {
    const comment = await Comment.create({ content, task, createdBy });
    return comment.populate('createdBy', 'name email');
};

const getCommentsByTask = async (taskId) => {
    return Comment.find({ task: taskId })
        .populate('createdBy', 'name email')
        .sort({ createdAt: 1 });
};

const getCommentById = async (commentId) => {
    return Comment.findById(commentId);
};

const updateComment = async (commentId, content) => {
    return Comment.findByIdAndUpdate(commentId, { content }, { new: true })
        .populate('createdBy', 'name email');
};

const deleteComment = async (commentId) => {
    return Comment.findByIdAndDelete(commentId);
};

const isCommentAuthor = async (commentId, userId) => {
    const comment = await Comment.findById(commentId);
    return comment && comment.createdBy.equals(userId);
};

module.exports = {
    createComment,
    getCommentsByTask,
    getCommentById,
    updateComment,
    deleteComment,
    isCommentAuthor
};
