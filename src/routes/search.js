const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate, loadUser } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { searchSchema } = require('../validators/schemas');

// Require authentication
router.use(authenticate);

// Global search endpoint
router.get('/', loadUser, validate(searchSchema, 'query'), searchController.search);

module.exports = router;
