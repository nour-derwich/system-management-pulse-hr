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
    console.log('New client connected');
    
    // Join a kanban board room
    socket.on('join-board', (boardId) => {
      socket.join(`board-${boardId}`);
      console.log(`Client joined board ${boardId}`);
    });
    
    // Register kanban event handlers
    kanbanHandlers(io, socket);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
