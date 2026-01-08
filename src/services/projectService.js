const Project = require('../models/Project');
const mongoose = require('mongoose');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createProject = async ({ name, description, createdBy }) => {
    const project = await Project.create({
        name,
        description,
        createdBy,
        members: [createdBy]
    });
    return project;
};

const getProjectsByUser = async (userId, { cursor, limit = DEFAULT_LIMIT } = {}) => {
    const parsedLimit = Math.min(parseInt(limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const query = {
        $or: [
            { createdBy: userId },
            { members: userId }
        ]
    };

    if (cursor) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const projects = await Project.find(query)
        .populate('members', 'name email')
        .populate('createdBy', 'name email')
        .sort({ _id: -1 })
        .limit(parsedLimit + 1);

    const hasMore = projects.length > parsedLimit;
    const data = hasMore ? projects.slice(0, parsedLimit) : projects;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return {
        data,
        pagination: { hasMore, nextCursor }
    };
};

const getProjectById = async (projectId) => {
    return Project.findById(projectId)
        .populate('members', 'name email')
        .populate('createdBy', 'name email');
};

const updateProject = async (projectId, updates) => {
    return Project.findByIdAndUpdate(projectId, updates, { new: true })
        .populate('members', 'name email')
        .populate('createdBy', 'name email');
};

const deleteProject = async (projectId) => {
    return Project.findByIdAndDelete(projectId);
};

const addMember = async (projectId, userId) => {
    return Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { members: userId } },
        { new: true }
    ).populate('members', 'name email');
};

const removeMember = async (projectId, userId) => {
    return Project.findByIdAndUpdate(
        projectId,
        { $pull: { members: userId } },
        { new: true }
    ).populate('members', 'name email');
};

const isProjectOwner = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    return project && project.createdBy.equals(userId);
};

const isProjectMember = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return false;
    return project.createdBy.equals(userId) || project.members.some(m => m.equals(userId));
};

module.exports = {
    createProject,
    getProjectsByUser,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    isProjectOwner,
    isProjectMember
};
