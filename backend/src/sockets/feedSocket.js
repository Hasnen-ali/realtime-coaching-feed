let ioInstance;

export const registerSocketServer = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.emit('socket:connected', {
      socketId: socket.id,
      connectedAt: new Date().toISOString()
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
};

export const emitFeedCreated = (feed) => {
  if (!ioInstance) return;

  // All writes go through the REST controller, so this emits once per persisted feed.
  ioInstance.emit('feed:created', feed);
};
