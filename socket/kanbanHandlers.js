// socket/kanbanHandlers.js
const db = require('../config/db'); // Assume you have a database connection

module.exports = (io, socket) => {
  // Handle task creation
  socket.on('create-task', async (data) => {
    try {
      // Validate input data
      if (!data.boardId || !data.task || !data.columnId) {
        return socket.emit('error', { message: 'Missing required fields for task creation' });
      }
      
      // Save task to database (this is pseudo-code, replace with your actual DB logic)
      // const newTask = await db.tasks.create({
      //   ...data.task,
      //   columnId: data.columnId,
      //   boardId: data.boardId
      // });
      
      // For demo, we'll just echo back the data
      const newTask = { ...data.task, id: Date.now().toString() };
      
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-created', {
        task: newTask,
        column: data.columnId
      });
      
      // Acknowledge successful creation to the sender
      socket.emit('task-created-ack', { success: true, task: newTask });
      
    } catch (error) {
      console.error('Error creating task:', error);
      socket.emit('error', { message: 'Could not create task', error: error.message });
    }
  });

  // Handle task update
  socket.on('update-task', async (data) => {
    try {
      // Validate input data
      if (!data.boardId || !data.task || !data.task.id) {
        return socket.emit('error', { message: 'Missing required fields for task update' });
      }
      
      // Update task in database (this is pseudo-code, replace with your actual DB logic)
      // const updatedTask = await db.tasks.update(data.task.id, {
      //   ...data.task
      // });
      
      // For demo, we'll just echo back the data
      const updatedTask = { ...data.task };
      
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-updated', {
        task: updatedTask
      });
      
      // Acknowledge successful update to the sender
      socket.emit('task-updated-ack', { success: true, task: updatedTask });
      
    } catch (error) {
      console.error('Error updating task:', error);
      socket.emit('error', { message: 'Could not update task', error: error.message });
    }
  });

  // Handle task movement between columns
  socket.on('move-task', async (data) => {
    try {
      // Validate input data
      if (!data.boardId || !data.taskId || !data.fromColumn || !data.toColumn || data.order === undefined) {
        return socket.emit('error', { message: 'Missing required fields for task movement' });
      }
      
      console.log(`Moving task ${data.taskId} from column ${data.fromColumn} to ${data.toColumn} at position ${data.order}`);
      
      // Update task position in database (this is pseudo-code, replace with your actual DB logic)
      // await db.tasks.updatePosition(data.taskId, {
      //   columnId: data.toColumn,
      //   order: data.order
      // });
      
      // Also update orders of other tasks in both columns
      // This would be database-specific logic
      
      // Broadcast to all clients in the board room EXCEPT the sender
      socket.to(`board-${data.boardId}`).emit('task-moved', {
        taskId: data.taskId,
        fromColumn: data.fromColumn,
        toColumn: data.toColumn,
        order: data.order,
        boardId: data.boardId
      });
      
      // Acknowledge successful move to the sender
      socket.emit('task-moved-ack', { success: true });
      
    } catch (error) {
      console.error('Error moving task:', error);
      socket.emit('error', { message: 'Could not move task', error: error.message });
    }
  });

  // Handle task deletion
  socket.on('delete-task', async (data) => {
    try {
      // Validate input data
      if (!data.boardId || !data.taskId || !data.columnId) {
        return socket.emit('error', { message: 'Missing required fields for task deletion' });
      }
      
      // Delete task from database (this is pseudo-code, replace with your actual DB logic)
      // await db.tasks.delete(data.taskId);
      
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-deleted', {
        taskId: data.taskId,
        columnId: data.columnId
      });
      
      // Acknowledge successful deletion to the sender
      socket.emit('task-deleted-ack', { success: true });
      
    } catch (error) {
      console.error('Error deleting task:', error);
      socket.emit('error', { message: 'Could not delete task', error: error.message });
    }
  });
   // Handle task selection
  socket.on('task-selected', (data) => {
    const { boardId, taskId, userId } = data;
    
    // Broadcast to all other users in the same board
    socket.to(`board-${boardId}`).emit('task-selected', {
      taskId,
      userId,
      selectedAt: new Date().toISOString()
    });
  });
// Handle task deselection
  socket.on('task-deselected', (data) => {
    const { boardId, userId } = data;
    socket.to(`board-${boardId}`).emit('task-deselected', { userId });
  });
  // Handle user typing/activity indicators
  socket.on('user-activity', (data) => {
    if (!data.boardId || !data.userId) return;
    
    // Broadcast to others that this user is active
    socket.to(`board-${data.boardId}`).emit('user-active', {
      userId: data.userId,
      taskId: data.taskId, // Optional - if they're working on a specific task
      activity: data.activity // e.g., "typing", "viewing", etc.
    });
  });
};