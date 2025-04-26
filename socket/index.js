//soket/index
const kanbanHandlers = require('./kanbanHandlers');

module.exports = (io) => {
  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // Verify token here
    // If valid, call next()
    // If invalid, call next(new Error('Authentication error'))
    next();
  });

  io.on('connection', (socket) => {
    console.log(`New client connected with ID: ${socket.id}`);
    
    // Join a kanban board room
    socket.on('join-board', (boardId) => {
      socket.join(`board-${boardId}`);
      console.log(`Client ${socket.id} joined board ${boardId}`);
      // Emit back to client they've successfully joined
      socket.emit('board-joined', { boardId });
    });
    
    // Log all incoming events for debugging
    socket.onAny((event, ...args) => {
      console.log(`[Socket] Event '${event}' from ${socket.id}:`, JSON.stringify(args));
    });
    console.log(`Socket ${socket.id} connected to rooms:`, socket.rooms);

    // Register kanban event handlers
    kanbanHandlers(io, socket);
    
    // Log disconnections with more detail
    socket.on('disconnect', (reason) => {
      console.log(`Client ${socket.id} disconnected. Reason: ${reason}`);
    });
    // In your move-task handler
  socket.on('move-task', (data) => {
    console.log('Received move-task:', data);
    socket.to(`board-${data.boardId}`).emit('task-moved', data);
    console.log(`Emitted task-moved to board-${data.boardId}`);
  });
  });
  
};