module.exports = (io, socket) => {
  // Handle task creation
  socket.on('create-task', async (data) => {
    try {
      // Save task to database
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-created', {
        task: data.task,
        column: data.columnId
      });
    } catch (error) {
      socket.emit('error', { message: 'Could not create task' });
    }
  });
  
  // Handle task update
  socket.on('update-task', async (data) => {
    try {
      // Update task in database
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-updated', {
        task: data.task
      });
    } catch (error) {
      socket.emit('error', { message: 'Could not update task' });
    }
  });
  
  // Handle task movement between columns
  socket.on('move-task', async (data) => {
    try {
      // Update task position in database
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-moved', {
        taskId: data.taskId,
        fromColumn: data.fromColumn,
        toColumn: data.toColumn,
        order: data.order
      });
    } catch (error) {
      socket.emit('error', { message: 'Could not move task' });
    }
  });
  
  // Handle task deletion
  socket.on('delete-task', async (data) => {
    try {
      // Delete task from database
      // Broadcast to all clients in the board room
      io.to(`board-${data.boardId}`).emit('task-deleted', {
        taskId: data.taskId,
        columnId: data.columnId
      });
    } catch (error) {
      socket.emit('error', { message: 'Could not delete task' });
    }
  });
};
