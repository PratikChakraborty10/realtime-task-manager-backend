const Project = require('../models/Project');

const createProject = async ({ name, description, createdBy }) => {
    const project = await Project.create({
        name,
        description,
        createdBy,
        members: [createdBy]
    });
    return project;
};

const getProjectsByUser = async (userId) => {
    return Project.find({
        $or: [
            { createdBy: userId },
            { members: userId }
        ]
    }).populate('members', 'name email')
        .populate('createdBy', 'name email');
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
