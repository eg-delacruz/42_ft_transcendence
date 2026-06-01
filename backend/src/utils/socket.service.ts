/**
 * Socket Service
 * Business logic for Socket.IO operations (presence, rooms, users)
 * Abstracts Redis operations and Socket.IO instance interactions
 */

import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { UserPresence, SocketUser, SocketErrorCode, SocketErrorResponse } from '@/types/socket';
import { logger } from '@/config/logger';

const PRESENCE_PREFIX = 'user_presence:';
const ROOM_USERS_PREFIX = 'room_users:';
const PRESENCE_TTL = 3600; // 1 hour

export class SocketService {
    private io: Server;
    private redis: Redis;

    constructor(io: Server, redis: Redis) {
        this.io = io;
        this.redis = redis;
    }

    /**
     * Get all connected users
     */
    async getConnectedUsers(): Promise<UserPresence[]> {
        try {
            const keys = await this.redis.keys(`${PRESENCE_PREFIX}*`);
            if (keys.length === 0) return [];

            const users: UserPresence[] = [];
            for (const key of keys) {
                const data = await this.redis.get(key);
                if (data) {
                    users.push(JSON.parse(data));
                }
            }
            return users;
        } catch (error) {
            logger.error('Error getting connected users:', error);
            return [];
        }
    }

    /**
     * Get all sockets for a specific user
     */
    async getUserSockets(userId: string): Promise<any[]> {
        try {
            const sockets = await this.io.in(`user:${userId}`).fetchSockets();
            return sockets;
        } catch (error) {
            logger.error(`Error fetching sockets for user ${userId}:`, error);
            return [];
        }
    }

    /**
     * Get all users in a specific room
     */
    async getRoomUsers(roomId: string): Promise<UserPresence[]> {
        try {
            const key = `${ROOM_USERS_PREFIX}${roomId}`;
            const userIds = await this.redis.smembers(key);

            if (userIds.length === 0) return [];

            const users: UserPresence[] = [];
            for (const userId of userIds) {
                const presenceKey = `${PRESENCE_PREFIX}${userId}`;
                const data = await this.redis.get(presenceKey);
                if (data) {
                    users.push(JSON.parse(data));
                }
            }
            return users;
        } catch (error) {
            logger.error(`Error getting room users for ${roomId}:`, error);
            return [];
        }
    }

    /**
     * Add user presence to Redis
     * Updates presence data and sets TTL for auto-cleanup
     */
    async addUserPresence(user: SocketUser, rooms: string[] = []): Promise<void> {
        try {
            const presence: UserPresence = {
                userId: user.id,
                email: user.email,
                username: user.username,
                rooms,
                connectedAt: new Date(),
                lastSeen: new Date(),
            };

            const key = `${PRESENCE_PREFIX}${user.id}`;
            await this.redis.setex(key, PRESENCE_TTL, JSON.stringify(presence));

            logger.debug(`User presence added: ${user.id} in rooms ${rooms.join(', ')}`);
        } catch (error) {
            logger.error(`Error adding user presence for ${user.id}:`, error);
        }
    }

    /**
     * Remove user presence from Redis
     */
    async removeUserPresence(userId: string): Promise<void> {
        try {
            const key = `${PRESENCE_PREFIX}${userId}`;
            await this.redis.del(key);

            logger.debug(`User presence removed: ${userId}`);
        } catch (error) {
            logger.error(`Error removing user presence for ${userId}:`, error);
        }
    }

    /**
     * Update user presence with new rooms list
     */
    async updateUserPresence(user: SocketUser, rooms: string[]): Promise<void> {
        try {
            const presence: UserPresence = {
                userId: user.id,
                email: user.email,
                username: user.username,
                rooms,
                connectedAt: new Date(),
                lastSeen: new Date(),
            };

            const key = `${PRESENCE_PREFIX}${user.id}`;
            await this.redis.setex(key, PRESENCE_TTL, JSON.stringify(presence));

            logger.debug(`User presence updated: ${user.id} in rooms ${rooms.join(', ')}`);
        } catch (error) {
            logger.error(`Error updating user presence for ${user.id}:`, error);
        }
    }

    /**
     * Add user to room (Redis set)
     */
    async addUserToRoom(userId: string, roomId: string): Promise<void> {
        try {
            const key = `${ROOM_USERS_PREFIX}${roomId}`;
            await this.redis.sadd(key, userId);
            logger.debug(`User ${userId} added to room ${roomId}`);
        } catch (error) {
            logger.error(`Error adding user to room:`, error);
        }
    }

    /**
     * Remove user from room (Redis set)
     */
    async removeUserFromRoom(userId: string, roomId: string): Promise<void> {
        try {
            const key = `${ROOM_USERS_PREFIX}${roomId}`;
            await this.redis.srem(key, userId);
            logger.debug(`User ${userId} removed from room ${roomId}`);
        } catch (error) {
            logger.error(`Error removing user from room:`, error);
        }
    }

    /**
     * Broadcast event to a specific room
     */
    broadcastToRoom(roomId: string, event: string, data: any): void {
        try {
            this.io.to(roomId).emit(event, data);
            logger.debug(`Broadcast to room ${roomId}: ${event}`);
        } catch (error) {
            logger.error(`Error broadcasting to room ${roomId}:`, error);
        }
    }

    /**
     * Broadcast event to specific user (all their sockets)
     */
    broadcastToUser(userId: string, event: string, data: any): void {
        try {
            this.io.to(`user:${userId}`).emit(event, data);
            logger.debug(`Broadcast to user ${userId}: ${event}`);
        } catch (error) {
            logger.error(`Error broadcasting to user ${userId}:`, error);
        }
    }

    /**
     * Create standardized error response
     */
    static createError(code: SocketErrorCode, message: string, details?: Record<string, any>): SocketErrorResponse {
        return {
            code,
            message,
            details,
            timestamp: new Date(),
        };
    }

    /**
     * Check if user is in room
     */
    async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
        try {
            const key = `${ROOM_USERS_PREFIX}${roomId}`;
            const isMember = await this.redis.sismember(key, userId);
            return isMember === 1;
        } catch (error) {
            logger.error(`Error checking user in room:`, error);
            return false;
        }
    }
}
