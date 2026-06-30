/**
 * /chat namespace
 * Registers auth middleware, connection handler, and event handlers.
 */

import { Server, Namespace } from 'socket.io';
import { Redis } from 'ioredis';

import { jwtSocketMiddleware } from '@utils/socket-auth';
import { SocketService } from '@utils/socket.service';
import { logger } from '@config/logger';
import { SocketUser } from '@interfaces/socket';
import { setupChatHandlers } from './chat.handlers';
import { ChatService } from './chat.service';

export function initializeChatNamespace(io: Server, redis: Redis): Namespace {
    const chatNamespace = io.of('/chat');
    const socketService = new SocketService(chatNamespace, redis);
    const chatService = new ChatService(redis, socketService);

    logger.info('[/chat] Initializing namespace');

    // Ensure the global room exists before any connection
    chatService.ensureGlobalRoom().catch((error) => {
        logger.error('[/chat] Failed to ensure global room:', error);
    });

    // ── Auth middleware ────────────────────────────────────────────────────
    // IMPORTANT: Socket.IO 4.x does NOT inherit io.use() in custom namespaces.
    // Each namespace must register its own middleware chain.
    chatNamespace.use(jwtSocketMiddleware);

    // ── Connection handler ─────────────────────────────────────────────────
    chatNamespace.on('connection', async (socket) => {
        const user = socket.data.user as SocketUser | undefined;
        const userId = user?.userId;

        logger.info(`[/chat] connected socket=${socket.id} user=${userId}`);

        // Initialize per-socket room tracking
        socket.data.rooms = new Set<string>();

        // Join a personal room so we can target this user from any replica
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // Register presence in Redis
        if (user) {
            await socketService.addUserPresence(user, []);
        }

        // Ensure global room exists and auto-join every authenticated user
        if (user) {
            await chatService.ensureGlobalRoom();
            socket.join(ChatService.GLOBAL_ROOM_ID);
            socket.data.rooms.add(ChatService.GLOBAL_ROOM_ID);
            await socketService.addUserToRoom(user.userId, ChatService.GLOBAL_ROOM_ID);
            await chatService.updateRoomMemberCount(ChatService.GLOBAL_ROOM_ID);

            socketService.broadcastToRoom(ChatService.GLOBAL_ROOM_ID, 'room:user_joined', {
                roomId: ChatService.GLOBAL_ROOM_ID,
                user,
                timestamp: new Date(),
            });
        }

        // Register all event handlers for this socket
        setupChatHandlers(socket, socketService, chatService);

        // ── Disconnect ─────────────────────────────────────────────────────
        socket.on('disconnect', (reason) => {
            logger.info(`[/chat] disconnected socket=${socket.id} user=${userId} reason=${reason}`);

            if (!userId) return;

            // Clean up room memberships in Redis
            const joinedRooms = Array.from(socket.data.rooms ?? []) as string[];
            for (const roomId of joinedRooms) {
                void socketService.removeUserFromRoom(userId, roomId);
                if (roomId === ChatService.GLOBAL_ROOM_ID) {
                    void chatService.updateRoomMemberCount(ChatService.GLOBAL_ROOM_ID);
                }
            }

            // Remove presence entry
            void socketService.removeUserPresence(userId);
        });

        // ── Socket-level error ─────────────────────────────────────────────
        socket.on('error', (error) => {
            logger.error(`[/chat] socket error socket=${socket.id} user=${userId}:`, error);
        });
    });

    return chatNamespace;
}