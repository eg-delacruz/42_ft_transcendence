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

async function startServer() {
    await connectDB();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
        cors: {
            origin: `http://localhost:${env.FRONT_PORT}`,
            credentials: true,
        },
    });

    // ── Redis adapter ──────────────────────────────────────────────────────
    // Declared outside try so it's accessible for initializeChatNamespace.
    let pubClient: Redis | null = null;

    try {
        pubClient = new Redis(env.REDIS_URL, { lazyConnect: true });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('[✓] Redis connected and socket.io adapter configured');
    } catch (error) {
        logger.error('[✗] Failed to connect to Redis:', error);
        // pubClient stays null; chat namespace will not be initialized
    }

    // ── Global auth middleware (root namespace /) ──────────────────────────
    // Each namespace also registers jwtSocketMiddleware independently
    // because Socket.IO 4.x does NOT propagate io.use() to custom namespaces.
    io.use(jwtSocketMiddleware);

    // ── /chat namespace ────────────────────────────────────────────────────
    if (pubClient) {
        initializeChatNamespace(io, pubClient);
    } else {
        logger.error('[✗] Chat namespace not initialized: Redis unavailable');
    }

    // ── Root namespace connection handler ──────────────────────────────────
    io.on('connection', (socket: Socket) => {
        const user = socket.data.user as SocketUser | undefined;
        logger.info(`[ws:/] connected socket=${socket.id} user=${user?.userId ?? 'unknown'}`);

        // Minimal ping/pong for health checks
        socket.on('ping', () => {
            socket.emit('pong', { ok: true, timestamp: Date.now() });
        });

        socket.on('disconnect', (reason) => {
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