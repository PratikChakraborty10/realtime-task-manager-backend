const taskService = require('../services/taskService');
const commentService = require('../services/commentService');
const projectService = require('../services/projectService');
const userService = require('../services/userService');

// Task Controllers

const createTask = async (req, res) => {
    try {
        const { title, description, assignee } = req.body;
        const { projectId } = req.params;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        // Validate assignee is a project member
        if (assignee) {
            const isMember = await projectService.isProjectMember(projectId, assignee);
            if (!isMember) {
                return res.status(400).json({
                    success: false,
                    message: 'Assignee must be a member of the project'
                });
            }
        }

        const task = await taskService.createTask({
            title,
            description,
            assignee,
            project: projectId,
            createdBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const { cursor, limit } = req.query;
        const result = await taskService.getTasksByProject(req.params.projectId, { cursor, limit });

        return res.status(200).json({
            success: true,
            tasks: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTask = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            task
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { title, description, status, assignee } = req.body;
        const { projectId, taskId } = req.params;
        const updates = {};

        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;

        // Validate assignee is a project member
        if (assignee !== undefined) {
            if (assignee) {
                const isMember = await projectService.isProjectMember(projectId, assignee);
                if (!isMember) {
                    return res.status(400).json({
                        success: false,
                        message: 'Assignee must be a member of the project'
                    });
                }
            }
            updates.assignee = assignee;
        }

        const task = await taskService.updateTask(taskId, updates);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        await taskService.deleteTask(req.params.taskId);

        return res.status(200).json({
            success: true,
            message: 'Task and its comments deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Comment Controllers

const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { taskId } = req.params;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const comment = await commentService.createComment({
            content,
            task: taskId,
            createdBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getComments = async (req, res) => {
    try {
        const { cursor, limit } = req.query;
        const result = await commentService.getCommentsByTask(req.params.taskId, { cursor, limit });

        return res.status(200).json({
            success: true,
            comments: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { commentId } = req.params;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const isAuthor = await commentService.isCommentAuthor(commentId, req.user._id);
        if (!isAuthor) {
            return res.status(403).json({
                success: false,
                message: 'Only the comment author can edit this comment'
            });
        }

        const comment = await commentService.updateComment(commentId, content);

        return res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const isAuthor = await commentService.isCommentAuthor(commentId, req.user._id);
        if (!isAuthor) {
            return res.status(403).json({
                success: false,
                message: 'Only the comment author can delete this comment'
            });
        }

        await commentService.deleteComment(commentId);

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    addComment,
    getComments,
    updateComment,
    deleteComment
};
