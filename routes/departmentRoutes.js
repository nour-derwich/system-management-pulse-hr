const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateJWT, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get all departments
router.get('/', departmentController.getDepartments);

// Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// Create department - restricted to admin and manager
router.post(
  '/',
  authorize('admin', 'manager'),
  departmentController.createDepartment
);

// Update department - restricted to admin and manager
router.put(
  '/:id',
  authorize('admin', 'manager'),
  departmentController.updateDepartment
);

// Delete department - restricted to admin
router.delete(
  '/:id',
  authorize('admin'),
  departmentController.deleteDepartment
);

// Get employees in department
router.get(
  '/:id/employees',
  departmentController.getDepartmentEmployees
);

module.exports = router;