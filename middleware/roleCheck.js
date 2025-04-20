/**
 * Role-based permission middleware
 * Checks if a user has the required permissions based on their role
 */

// Permission mapping for different roles
const rolePermissions = {
  admin: [
    'manage_users',
    'manage_departments',
    'manage_employees',
    'manage_positions',
    'manage_all_boards',
    'view_all_boards',
    'delete_boards',
    'manage_system_settings'
  ],
  manager: [
    'manage_employees',
    'create_board',
    'manage_own_boards',
    'view_department_boards',
    'assign_tasks'
  ],
  team_lead: [
    'create_board',
    'manage_own_boards',
    'view_team_boards',
    'assign_tasks'
  ],
  employee: [
    'view_assigned_boards',
    'manage_assigned_tasks',
    'update_task_status'
  ]
};

/**
 * Check if the user has the required permissions
 * @param {...String} requiredPermissions - The permissions required to access a resource
 * @returns {Function} Middleware function
 */
exports.checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const userRole = req.user.role;
    const userPermissions = rolePermissions[userRole] || [];

    // Check if the user has all the required permissions
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'You do not have sufficient permissions for this action' 
      });
    }

    next();
  };
};

/**
 * Check if user can access a specific resource (e.g., kanban board)
 * @param {String} resourceType - Type of resource being accessed (e.g., 'board', 'task')
 * @returns {Function} Middleware function
 */
exports.checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params; // Resource ID
      const userId = req.user.id;
      const userRole = req.user.role;

      // Skip additional checks for admin users
      if (userRole === 'admin') {
        return next();
      }

      let hasAccess = false;
      
      switch (resourceType) {
        case 'board':
          // Get the board from database
          const KanbanBoard = require('../models/KanbanBoard');
          const board = await KanbanBoard.findById(id);
          
          if (!board) {
            return res.status(404).json({ message: 'Board not found' });
          }
          
          // Check if user is the owner or has access to the board
          hasAccess = board.owner.equals(userId) || 
                      board.members.includes(userId) ||
                      (userRole === 'manager' && board.departmentId);
          break;
          
        case 'task':
          // Get the task from database
          const KanbanTask = require('../models/KanbanTask');
          const task = await KanbanTask.findById(id).populate('boardId');
          
          if (!task) {
            return res.status(404).json({ message: 'Task not found' });
          }
          
          // Check if user is assigned to the task or is the board owner
          hasAccess = task.assignedTo.includes(userId) || 
                      (task.boardId && task.boardId.owner.equals(userId)) ||
                      (userRole === 'manager' && task.boardId && task.boardId.departmentId);
          break;
          
        default:
          return res.status(400).json({ message: 'Invalid resource type' });
      }

      if (!hasAccess) {
        return res.status(403).json({ message: 'You do not have access to this resource' });
      }

      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({ message: 'Server error during permission check' });
    }
  };
};

/**
 * Check if user is the owner of a resource
 * @param {String} resourceType - Type of resource being accessed (e.g., 'board', 'task')
 * @returns {Function} Middleware function
 */
exports.checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params; // Resource ID
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admin always has ownership privileges
      if (userRole === 'admin') {
        return next();
      }
      
      let isOwner = false;
      
      switch (resourceType) {
        case 'board':
          const KanbanBoard = require('../models/KanbanBoard');
          const board = await KanbanBoard.findById(id);
          
          if (!board) {
            return res.status(404).json({ message: 'Board not found' });
          }
          
          isOwner = board.owner.equals(userId);
          break;
          
        case 'task':
          const KanbanTask = require('../models/KanbanTask');
          const task = await KanbanTask.findById(id).populate('boardId');
          
          if (!task) {
            return res.status(404).json({ message: 'Task not found' });
          }
          
          isOwner = task.createdBy.equals(userId) || 
                   (task.boardId && task.boardId.owner.equals(userId));
          break;
          
        default:
          return res.status(400).json({ message: 'Invalid resource type' });
      }
      
      if (!isOwner) {
        return res.status(403).json({ message: 'Only the owner can perform this action' });
      }
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Server error during ownership check' });
    }
  };
};