// server.js
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // For testing only, restrict in production
    methods: ["GET", "POST"]
  }
});

// Make io available throughout the app
app.set('socketio', io);

// Initialize socket handlers
require('./socket/index')(io);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized and ready`);
});