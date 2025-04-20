const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user route
router.get('/me', authenticateJWT, getCurrentUser);

module.exports = router;
