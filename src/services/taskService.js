const Task = require('../models/Task');
const Comment = require('../models/Comment');

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

const getTasksByProject = async (projectId) => {
    return Task.find({ project: projectId })
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
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
    await Comment.deleteMany({ task: taskId });
    return Task.findByIdAndDelete(taskId);
};

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask
};
