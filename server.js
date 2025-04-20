const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server);
require('./socket')(io);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));