const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, requireAdmin, loadUser } = require('../middleware/auth');
const { requireOwner, requireMember } = require('../middleware/projectAuth');
const { validate } = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema, getProjectsSchema } = require('../validators/schemas');

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', requireAdmin, validate(createProjectSchema), projectController.createProject);
router.get('/', loadUser, validate(getProjectsSchema, 'query'), projectController.getProjects);
router.get('/:id', requireMember, projectController.getProject);
router.patch('/:id', requireMember, validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', requireOwner, projectController.deleteProject);

// Member management (admin only)
router.post('/:id/members', requireAdmin, requireOwner, validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', requireAdmin, requireOwner, projectController.removeMember);

module.exports = router;
