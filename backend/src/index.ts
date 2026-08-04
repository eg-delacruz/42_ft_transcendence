// This is the main entry point of the server application. Here, we import the Express app from app.ts
// and start the server on the specified port.

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from '@config/db';

import app from '@/app';
import env from '@config/env';
import { logger } from '@config/logger';
import { ensureSuperUser } from '@scripts/seed';

// Crear el servidor HTTP envolviendo la app de Express
const server = http.createServer(app);

// Inicializar Socket.IO con soporte de CORS
export const io = new Server(server, {
  cors: {
    origin: `http://localhost:${env.FRONT_PORT}`,
    credentials: true,
  },
});

// Guardado en memoria temporal de posiciones para testear
interface PlayerPosition {
  x: number;
  y: number;
}
const players: Record<string, PlayerPosition> = {};

// Eventos de WebSockets
io.on('connection', (socket) => {
  logger.info(`⚡ Cliente conectado vía WebSocket: ${socket.id}`);

  // Registrar nuevo jugador con posición inicial en el canvas (ej: x: 100, y: 100)
  players[socket.id] = { x: 100, y: 100 };

  // Notificar a todos los clientes la lista de jugadores actual
  io.emit('stateUpdate', players);

  // Escuchar movimiento enviado desde el frontend
  socket.on('move', (data: { x: number; y: number }) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      // Emitir estado actualizado a todos
      io.emit('stateUpdate', players);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    logger.info(`❌ Cliente desconectado: ${socket.id}`);
    delete players[socket.id];
    io.emit('stateUpdate', players);
  });
});

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Init a super user in the DB
    await ensureSuperUser();

    // Escuchar peticiones en el servidor HTTP (Express + Socket.IO)
    server.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} on port ${env.PORT} with Socket.IO enabled`);
    });
  } catch (error) {
    logger.error('Failed to start server:' + error);
    process.exit(1);
  }
}

startServer();