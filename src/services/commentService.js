const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createComment = async ({ content, task, createdBy }) => {
    const comment = await Comment.create({ content, task, createdBy });
    return comment.populate('createdBy', 'name email');
};

const getCommentsByTask = async (taskId, { cursor, limit = DEFAULT_LIMIT } = {}) => {
    const parsedLimit = Math.min(parseInt(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const query = { task: taskId };

    // Comments sorted oldest first, so cursor goes forward
    if (cursor) {
        query._id = { $gt: new mongoose.Types.ObjectId(cursor) };
    }

    const comments = await Comment.find(query)
        .populate('createdBy', 'name email')
        .sort({ _id: 1 })
        .limit(parsedLimit + 1);

    const hasMore = comments.length > parsedLimit;
    const data = hasMore ? comments.slice(0, parsedLimit) : comments;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return {
        data,
        pagination: { hasMore, nextCursor }
    };
};

const getCommentById = async (commentId) => {
    return Comment.findById(commentId);
};

const updateComment = async (commentId, content) => {
    return Comment.findByIdAndUpdate(commentId, { content }, { new: true })
        .populate('createdBy', 'name email');
};

const deleteComment = async (commentId) => {
    return Comment.findByIdAndUpdate(commentId, { deletedAt: new Date() });
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
