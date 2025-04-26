// app.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));
app.use('/api/positions', require('./routes/positionRoutes'));
app.use('/api/utils/kanban', require('./routes/kanbanRoutes'));

// Socket status API endpoint
app.get('/api/socket/status', (req, res) => {
  const io = req.app.get('socketio');
  
  if (!io) {
    return res.status(500).json({ 
      status: 'error',
      message: 'Socket.io not initialized or not available' 
    });
  }
  
  // Get active rooms (filtering out socket IDs which are usually ~20 chars)
  const rooms = Array.from(io.sockets.adapter.rooms || [])
    .filter(([room]) => !room.match(/^[0-9A-Za-z]{20}$/))
    .map(([room]) => {
      const clients = io.sockets.adapter.rooms.get(room);
      return {
        name: room,
        clientCount: clients ? clients.size : 0
      };
    });
  
  res.json({
    status: 'online',
    connectionsCount: io.engine ? io.engine.clientsCount : 0,
    activeRooms: rooms,
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

module.exports = app;