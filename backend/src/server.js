import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectMongo } from './config/db.js';
import { closeRedis, connectRedis } from './config/redis.js';
import { env } from './config/env.js';
import { registerSocketServer } from './sockets/feedSocket.js';

const startServer = async () => {
  await connectMongo();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.clientOrigins,
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  registerSocketServer(io);

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    console.log('Shutting down API...');
    io.close();
    server.close(async () => {
      await closeRedis();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
