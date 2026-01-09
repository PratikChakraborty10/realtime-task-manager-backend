const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { signupSchema, loginSchema, lookupUserSchema } = require('../validators/schemas');

// Public routes
router.post('/signup', validate(signupSchema), userController.signup);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.get('/get-profile', authenticate, userController.getProfile);
router.get('/users/lookup', authenticate, validate(lookupUserSchema, 'query'), userController.lookupUser);

module.exports = router;
