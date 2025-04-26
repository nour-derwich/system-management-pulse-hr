// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateJWT, authorize } = require('../middleware/auth');


// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get all employees
router.get('/lister/', employeeController.getEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Create employee with user account - restricted to admin and manager
router.post(
  '/',
  authorize('admin', 'manager'),
  employeeController.createEmployee
);

// Update employee - restricted to admin and manager
router.put(
  '/:id',
  authorize('admin', 'manager'),
  employeeController.updateEmployee
);

// Delete employee - restricted to admin
router.delete(
  '/:id',
  authorize('admin'),
  employeeController.deleteEmployee
);

// Get employees by department
router.get(
  '/department/:departmentId',
  employeeController.getEmployeesByDepartment
);

module.exports = router;