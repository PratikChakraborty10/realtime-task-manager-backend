const taskService = require('../services/taskService');
const commentService = require('../services/commentService');
const projectService = require('../services/projectService');
const userService = require('../services/userService');
const Task = require('../models/Task');
const { emitTaskCreated, emitTaskUpdated, emitTaskDeleted, emitCommentCreated, emitCommentUpdated, emitCommentDeleted } = require('../socket/emitter');

// Task Controllers

const createTask = async (req, res) => {
    try {
        const { title, description, assignee } = req.body;
        const { projectId } = req.params;

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

        // Emit real-time update
        emitTaskCreated(projectId, task);

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

        // Emit real-time update
        emitTaskUpdated(projectId, task);

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
        const { taskId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        // Get task and populate project to check project owner
        // We need direct access to Task model here for population if service doesn't support it
        // Or we can assume taskService.getTaskById populates project? 
        // Let's rely on taskService.getTaskById but we need to check if it populates project.createdBy
        // If not, we might need to modify service or fetch manually.
        // Assuming taskService.getTaskById populates project correctly based on previous context.
        // Actually, let's use the Task model directly to be safe and efficient if imported.
        // But Task model is not imported in this file. Let's use taskService for now.

        let task = await taskService.getTaskById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // We need to fetch the project to check its creator if it's not populated deep enough
        // task.project might be just ID or Object.
        // Let's assume we need to verify project ownership.

        // For robustness, let's just use the Task model to create a specific query

        task = await Task.findById(taskId).populate('project');

        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const isProjectManager = task.project && task.project.createdBy.equals(userId);
        const isTaskCreator = task.createdBy.equals(userId); // task.createdBy is ObjectId because we didn't populate it or we did? 
        // If using Task.findById(taskId).populate('project'), createdBy is ID.

        const isAdmin = userRole === 'ADMIN';

        if (!isAdmin && !isProjectManager && !isTaskCreator) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own tasks or must be Project Manager.'
            });
        }

        await taskService.deleteTask(taskId);

        emitTaskDeleted(task.project._id, taskId);

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
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

        const comment = await commentService.createComment({
            content,
            task: taskId,
            createdBy: req.user._id
        });

        // Emit real-time update
        emitCommentCreated(taskId, comment);

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

        const isAuthor = await commentService.isCommentAuthor(commentId, req.user._id);
        if (!isAuthor) {
            return res.status(403).json({
                success: false,
                message: 'Only the comment author can edit this comment'
            });
        }

        const comment = await commentService.updateComment(commentId, content);

        // Emit real-time update
        emitCommentUpdated(comment.task.toString(), comment);

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

        const comment = await commentService.getCommentById(commentId);
        const isAuthor = await commentService.isCommentAuthor(commentId, req.user._id);
        if (!isAuthor) {
            return res.status(403).json({
                success: false,
                message: 'Only the comment author can delete this comment'
            });
        }

        const taskId = comment.task.toString();
        await commentService.deleteComment(commentId);

        // Emit real-time update
        emitCommentDeleted(taskId, commentId);

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
