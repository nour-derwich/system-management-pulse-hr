const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorize } = require('../middleware/auth');

// Protected routes - require authentication
router.use(authenticateJWT);

// Get all users - admin only
router.get('/', authorize('admin'), userController.getUsers);

// Get users by role - admin only
router.get('/role/:role', authorize('admin'), userController.getUsersByRole);

// Get user by ID
router.get('/:id', authorize('admin', 'manager'), userController.getUserById);

// Create user - admin only
router.post('/', authorize('admin'), userController.createUser);

// Update user
router.put('/:id', authorize('admin'), userController.updateUser);

// Change password - user can change own password, admin can change any
router.put('/:id/password', userController.changePassword);

// Reset password - admin only
router.put('/:id/reset-password', authorize('admin'), userController.resetPassword);

// Delete user - admin only
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Get employee associated with user
router.get('/:id/employee', userController.getUserEmployee);

module.exports = router;
