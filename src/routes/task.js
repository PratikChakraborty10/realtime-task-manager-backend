const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, loadUser } = require('../middleware/auth');
const { requireMember } = require('../middleware/projectAuth');
const { validate } = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema, commentSchema } = require('../validators/schemas');

// All routes require authentication
router.use(authenticate);

// Task routes (nested under projects)
router.post('/projects/:projectId/tasks', requireMember, validate(createTaskSchema), taskController.createTask);
router.get('/projects/:projectId/tasks', requireMember, taskController.getTasks);
router.get('/projects/:projectId/tasks/:taskId', requireMember, taskController.getTask);
router.patch('/projects/:projectId/tasks/:taskId', requireMember, validate(updateTaskSchema), taskController.updateTask);
router.delete('/projects/:projectId/tasks/:taskId', requireMember, taskController.deleteTask);

// Comment routes
router.post('/tasks/:taskId/comments', loadUser, validate(commentSchema), taskController.addComment);
router.get('/tasks/:taskId/comments', loadUser, taskController.getComments);
router.patch('/comments/:commentId', loadUser, validate(commentSchema), taskController.updateComment);
router.delete('/comments/:commentId', loadUser, taskController.deleteComment);

module.exports = router;
