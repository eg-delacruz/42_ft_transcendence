/**
 * Chat Namespace
 * Configures /chat namespace with handlers and middleware
 */

import { Server, Namespace } from 'socket.io';
import { Redis } from 'ioredis';
import { setupChatHandlers } from './chat.handlers';
import { ChatService } from './chat.service';
import { SocketService } from '@/utils/socket.service';
import { logger } from '@/config/logger';

export function initializeChatNamespace(io: Server, redis: Redis): Namespace {
    const chatNamespace = io.of('/chat');
    const socketService = new SocketService(io, redis);
    const chatService = new ChatService();

    logger.info('Initializing /chat namespace');

    /**
     * Middleware - validates authentication for /chat namespace
     */
    chatNamespace.use((socket, next) => {
        const user = socket.data.user;

        if (!user) {
            logger.warn(`Unauthorized connection attempt to /chat from ${socket.id}`);
            return next(new Error('Unauthorized'));
        }

        logger.info(`User ${user.id} connected to /chat namespace`);
        next();
    });

    /**
     * Connection handler
     */
    chatNamespace.on('connection', (socket) => {
        const userId = socket.data.user?.id;

        logger.info(`[/chat] User ${userId} connected with socket ${socket.id}`);

        // Setup event handlers
        setupChatHandlers(socket, socketService, chatService);

        /**
         * Disconnect handler
         */
        socket.on('disconnect', (reason) => {
            logger.info(`[/chat] User ${userId} disconnected. Reason: ${reason}`);
            // TODO: Cleanup presence from rooms in Phase 2
        });

        /**
         * Error handler
         */
        socket.on('error', (error) => {
            logger.error(`[/chat] Socket error for user ${userId}:`, error);
        });
    });

    return chatNamespace;
}
