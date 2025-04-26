const express = require('express');
const router = express.Router();
const kanbanController = require('../controllers/kanbanController');
const kanbanTagController = require('../controllers/kanbanTagController');
const { authenticateJWT, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
// router.use(authenticateJWT);

// Board routes
router.get('/', kanbanController.getBoards);
router.get('/lister', kanbanController.getBoards);
router.get('/boards/:id', kanbanController.getBoardById);
router.post('/boards', authorize('admin', 'manager'), kanbanController.createBoard);
router.put('/boards/:id', authorize('admin', 'manager'), kanbanController.updateBoard);
router.delete('/boards/:id', authorize('admin', 'manager'), kanbanController.deleteBoard);

// Column routes
router.get('/boards/:boardId/columns', kanbanController.getColumns);
router.post('/boards/:boardId/columns', kanbanController.createColumn);
router.put('/columns/:columnId', kanbanController.updateColumn);
router.delete('/columns/:columnId', kanbanController.deleteColumn);

// Task routes
router.get('/columns/:columnId/tasks', kanbanController.getTasks);
router.post('/columns/:columnId/tasks', kanbanController.createTask);
router.put('/tasks/:taskId', kanbanController.updateTask);
router.post('/tasks/:taskId/move', kanbanController.moveTask);
router.delete('/tasks/:taskId', kanbanController.deleteTask); // Note: This needs to be implemented

// Tag routes
router.get('/tags', kanbanTagController.getTags);
router.get('/tags/:id', kanbanTagController.getTagById);
router.post('/tags', kanbanTagController.createTag);
router.put('/tags/:id', kanbanTagController.updateTag);
router.delete('/tags/:id', kanbanTagController.deleteTag);
router.get('/tags/:id/tasks', kanbanTagController.getTasksByTag);

module.exports = router;
