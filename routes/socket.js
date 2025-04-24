app.get('/api/socket-status', (req, res) => {
  const socketServer = req.app.get('socketio');
  if (!socketServer) {
    return res.status(500).json({ status: 'error', message: 'Socket.io not initialized' });
  }
  
  const stats = {
    status: 'online',
    connectionsCount: socketServer.engine.clientsCount,
    // Get list of rooms (filtering out socket IDs)
    activeRooms: Array.from(socketServer.sockets.adapter.rooms.keys())
      .filter(room => !room.match(/^[0-9A-Za-z]{20}$/)) // Basic filter for socket IDs
  };
  
  res.json(stats);
});