const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, loadUser } = require('../middleware/auth');
const { requireMember, requireOwner } = require('../middleware/projectAuth');

// All routes require authentication
router.use(authenticate);

// Task routes (nested under projects)
router.post('/projects/:projectId/tasks', requireMember, taskController.createTask);
router.get('/projects/:projectId/tasks', requireMember, taskController.getTasks);
router.get('/projects/:projectId/tasks/:taskId', requireMember, taskController.getTask);
router.patch('/projects/:projectId/tasks/:taskId', requireMember, taskController.updateTask);
router.delete('/projects/:projectId/tasks/:taskId', requireOwner, taskController.deleteTask);

// Comment routes
router.post('/tasks/:taskId/comments', loadUser, taskController.addComment);
router.get('/tasks/:taskId/comments', loadUser, taskController.getComments);
router.patch('/comments/:commentId', loadUser, taskController.updateComment);
router.delete('/comments/:commentId', loadUser, taskController.deleteComment);

module.exports = router;
