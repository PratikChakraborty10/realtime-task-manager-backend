const projectService = require('../services/projectService');
const userService = require('../services/userService');
const { emitProjectUpdated, emitProjectMemberAdded, emitProjectMemberRemoved } = require('../socket/emitter');

const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        // req.user is set by requireAdmin middleware
        const project = await projectService.createProject({
            name,
            description,
            createdBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProjects = async (req, res) => {
    try {
        const { cursor, limit, status, sortBy, sortOrder } = req.query;
        const result = await projectService.getProjectsByUser(req.user._id, {
            cursor,
            limit,
            status,
            sortBy,
            sortOrder
        });

        return res.status(200).json({
            success: true,
            projects: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProject = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;

        const project = await projectService.updateProject(req.params.id, updates);

        emitProjectUpdated(req.params.id, project);

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        await projectService.deleteProject(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addMember = async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if user exists in the platform
        const userToAdd = await userService.getUserById(userId);
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Cannot add non-existent user as member.'
            });
        }

        // Check if user is already a member
        const isMember = await projectService.isProjectMember(req.params.id, userId);
        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this project.'
            });
        }

        const project = await projectService.addMember(req.params.id, userId);

        emitProjectMemberAdded(req.params.id, project, userToAdd);

        return res.status(200).json({
            success: true,
            message: 'Member added successfully',
            project
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const project = await projectService.getProjectById(req.params.id);

        // Prevent removing the owner
        if (project.createdBy._id.equals(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove project owner'
            });
        }

        const updatedProject = await projectService.removeMember(req.params.id, userId);

        emitProjectMemberRemoved(req.params.id, updatedProject, userId);

        return res.status(200).json({
            success: true,
            message: 'Member removed successfully',
            project: updatedProject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
};
