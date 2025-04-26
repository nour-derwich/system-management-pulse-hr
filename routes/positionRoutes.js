const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { authenticateJWT, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get all positions
router.get('/lister/', positionController.getPositions);

// Get position by ID
router.get('/:id', positionController.getPositionById);

// Create position - restricted to admin and manager
router.post(
  '/',
  authorize('admin', 'manager'),
  positionController.createPosition
);

// Update position - restricted to admin and manager
router.put(
  '/:id',
  authorize('admin', 'manager'),
  positionController.updatePosition
);

// Delete position - restricted to admin
router.delete(
  '/:id',
  authorize('admin'),
  positionController.deletePosition
);

// Get employees with this position
router.get(
  '/:id/employees',
  positionController.getPositionEmployees
);

module.exports = router;

