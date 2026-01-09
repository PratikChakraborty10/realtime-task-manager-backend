const Task = require('../models/Task');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createTask = async ({ title, description, assignee, project, createdBy }) => {
    const task = await Task.create({
        title,
        description,
        assignee,
        project,
        createdBy
    });
    return task.populate(['assignee', 'createdBy'], 'name email');
};

const getTasksByProject = async (projectId, { cursor, limit = DEFAULT_LIMIT } = {}) => {
    const parsedLimit = Math.min(parseInt(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const query = { project: projectId };

    if (cursor) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const tasks = await Task.find(query)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .sort({ _id: -1 })
        .limit(parsedLimit + 1);

    const hasMore = tasks.length > parsedLimit;
    const data = hasMore ? tasks.slice(0, parsedLimit) : tasks;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return {
        data,
        pagination: { hasMore, nextCursor }
    };
};

const getTaskById = async (taskId) => {
    return Task.findById(taskId)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email');
};

const updateTask = async (taskId, updates) => {
    return Task.findByIdAndUpdate(taskId, updates, { new: true })
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email');
};

const deleteTask = async (taskId) => {
    // Soft delete: Mark task as deleted instead of removing
    // Also soft delete all related comments
    await Comment.updateMany({ task: taskId }, { deletedAt: new Date() });
    return Task.findByIdAndUpdate(taskId, { deletedAt: new Date() });
};

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask
};
