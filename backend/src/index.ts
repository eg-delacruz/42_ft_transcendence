// This is the main entry point of the backend.
// Here we initialize MongoDB, the HTTP server, and Socket.IO.

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server, type Socket } from 'socket.io';

import { connectDB } from '@config/db';
import app from '@/app.ts';
import env from '@config/env';
import { logger } from '@config/logger';
import { ensureSuperUser } from '@scripts/seed';

async function startServer() {
  // Connect to MongoDB before starting the server
  await connectDB();

  // Create an HTTP server from Express
  // This allows us to use the same port for HTTP and WebSockets
  const httpServer = http.createServer(app);

  // Initialize Socket.IO on the same HTTP server
  // credentials: true allows cookies and credentials to be sent from the frontend
  const io = new Server(httpServer, {
    cors: {
      origin: `http://localhost:${env.FRONT_PORT}`,
      credentials: true,
    },
  });

  // Redis adapter to synchronize events between multiple backend instances
  // If the project scales horizontally, Redis will propagate the messages
  try {
    const pubClient = new Redis(env.REDIS_URL, { lazyConnect: true });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('[✓] Connected to Redis and configured socket.io adapter');
  } catch (error) {
    logger.error('[✗] Failed to connect to Redis: ' + error);
  }

  // Authentication middleware for the Socket.IO handshake
  // Here we validate the JWT before allowing the socket connection
  io.use((socket: Socket, next) => {
    try {
      // The token can come from auth.token or from the Authorization header
      const authHeader = socket.handshake.headers?.authorization;
      const bearerToken = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

      const token = socket.handshake.auth?.token || bearerToken;

      // If there is no token, reject the connection
      if (!token) {
        return next(new Error('[✗] Authentication error: No token provided'));
      }

      // If the token is valid, store the decoded user in the socket
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch {
      // If the token fails, do not allow the socket to connect
      next(new Error('[✗] Authentication error: Invalid token'));
    }
  });

  // Base Socket.IO listener
  // For now we only check connection, ping, and disconnect
  io.on('connection', (socket) => {
    const user = socket.data.user as { id?: string } | undefined;

    logger.info(`[ws] connected socket=${socket.id} user=${user?.id ?? 'unknown'}`);

    // Minimal test event to verify that the connection responds
    socket.on('ping', () => {
      socket.emit('pong', { ok: true, timestamp: Date.now() });
    });

    // Cleanup / logs when the socket disconnects
    socket.on('disconnect', (reason) => {
      logger.info(`[ws] disconnected socket=${socket.id} reason=${reason}`);
    });
  });

  // Start the server listening on the configured port
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Socket.IO ready at ws://localhost:${env.PORT} with CORS from http://localhost:${env.FRONT_PORT}`);
  });

  // Create the initial super user in the database
  ensureSuperUser();
}

startServer().catch((error) => {
  logger.error('Failed to start server: ' + error);
  process.exit(1);
});
