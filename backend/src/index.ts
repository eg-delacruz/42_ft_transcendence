// Main entry point of the backend.
// Initializes MongoDB, HTTP server, Socket.IO, and Redis adapter.

import path from "path";
import dotenv from "dotenv";

// Busca el archivo .env en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import http from 'http';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server, type Socket } from 'socket.io';
import app from "@/app.ts";
import env from "@config/env";
import { logger } from "@config/logger";
import { ensureSuperUser, ensureGames } from "@scripts/seed";
import { connectDB } from '@config/db';
import { initializeChatNamespace } from '@modules/chat';
import { jwtSocketMiddleware } from '@utils/socket-auth';
import { SocketUser } from '@interfaces/socket';
import { SocketService } from '@utils/socket.service';

async function startServer() {
    await connectDB();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
        cors: {
            origin: (origin, cb) => cb(null, true),
            credentials: true,
        },
    });

    // ── Redis adapter ──────────────────────────────────────────────────────
    let pubClient: Redis | null = null;

    try {
        pubClient = new Redis(env.REDIS_URL, { lazyConnect: true });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('[✓] Redis connected and socket.io adapter configured');
    } catch (error) {
        logger.error('[✗] Failed to connect to Redis:', error);
    }

    // Instanciar SocketService solo si Redis está disponible
    const socketService = pubClient ? new SocketService(io, pubClient) : null;

    if (socketService) {
        const gameClock = setInterval(async () => {
            const state = await socketService.tickGameState();
            if (state) socketService.broadcastToRoom('global', 'game:state', state);
        }, 1000);
        gameClock.unref();
    }

    // ── Global auth middleware (root namespace /) ──────────────────────────
    io.use(jwtSocketMiddleware);

    // ── /chat namespace ────────────────────────────────────────────────────
    if (pubClient) {
        initializeChatNamespace(io, pubClient);
    } else {
        logger.error('[✗] Chat namespace not initialized: Redis unavailable');
    }

    // ── Root namespace connection handler ──────────────────────────────────
    io.on('connection', async (socket: Socket) => {
        const user = socket.data.user as SocketUser | undefined;
        logger.info(`[ws:/] connected socket=${socket.id} user=${user?.userId ?? 'unknown'}`);

        if (user && socketService) {
            // Unir el socket a la sala propia del usuario
            socket.join(`user:${user.userId}`);
            // Todos los usuarios comparten una única sala de juego global.
            socket.join('global');
            // Registrar la presencia del usuario
            await socketService.addUserPresence(user);

            const result = await socketService.joinMatchmaking(user, socket.id);
            if (result.payload) {
                if (result.created) {
                    socketService.broadcastToRoom('global', 'match_found', result.payload);
                } else {
                    socket.emit('match_found', result.payload);
                }
            } else {
                socket.emit('queue_status', { status: 'waiting', roomId: 'global' });
            }
        }

        // Minimal ping/pong for health checks
        socket.on('ping', () => {
            socket.emit('pong', { ok: true, timestamp: Date.now() });
        });

        socket.on('game:join', async (payload: { roomId: string; game: string }) => {
            if (!user || !socketService) return;
            const activeMatch = await socketService.getActiveGame();
            if (activeMatch?.roomId !== payload.roomId || activeMatch.game !== payload.game) {
                socket.emit('game:error', { code: 'INVALID_GAME_SESSION' });
                return;
            }
            socket.join(payload.roomId);
            socket.emit('game:ready', activeMatch);
            const gameState = await socketService.ensureGameState();
            if (gameState) socket.emit('game:state', gameState);
        });

        socket.on('game:action', async (payload) => {
            if (!user || !socketService) return;
            const result = await socketService.applyGameAction(user.userId, payload);
            if (!result) {
                socket.emit('game:error', { code: 'INVALID_GAME_ACTION' });
                return;
            }
            if (result.state) {
                socketService.broadcastToRoom('global', 'game:state', result.state);
            } else {
                socketService.broadcastToRoom('global', 'game:action', result.action);
            }
        });

        // ── Matchmaking Events ──────────────────────────────────────────────
        socket.on('join_matchmaking', async () => {
            if (!user || !socketService) {
                socket.emit('error', SocketService.createError('UNAUTHORIZED', 'Usuario o servicio no disponible'));
                return;
            }

            const result = await socketService.joinMatchmaking(user, socket.id);
            if (result.payload) {
                if (result.created) {
                    socketService.broadcastToRoom('global', 'match_found', result.payload);
                } else {
                    socket.emit('match_found', result.payload);
                }
            } else {
                socket.emit('queue_status', { status: 'waiting', roomId: 'global' });
            }
        });

        socket.on('leave_matchmaking', async () => {
            if (user && socketService) {
                await socketService.leaveMatchmaking(user.userId);
                socket.emit('queue_status', { status: 'cancelled' });
            }
        });

        socket.on('disconnect', async (reason) => {
            if (user && socketService) {
                await socketService.handlePlayerDeparture(user.userId);
                await socketService.removeUserPresence(user.userId);
            }
            logger.info(`[ws:/] disconnected socket=${socket.id} reason=${reason}`);
        });
    });

    // ── HTTP server ────────────────────────────────────────────────────────
    httpServer.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        logger.info(
            `Socket.IO ready — CORS origin: http://localhost:${env.FRONT_PORT}`,
        );
    });

    ensureSuperUser();
    ensureGames();
}

startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});