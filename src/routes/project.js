const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireOwner, requireMember } = require('../middleware/projectAuth');

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', requireAdmin, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', requireMember, projectController.getProject);
router.patch('/:id', requireOwner, projectController.updateProject);
router.delete('/:id', requireOwner, projectController.deleteProject);

// Member management (admin only)
router.post('/:id/members', requireAdmin, requireOwner, projectController.addMember);
router.delete('/:id/members/:userId', requireAdmin, requireOwner, projectController.removeMember);

module.exports = router;
