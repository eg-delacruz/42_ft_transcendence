/**
 * Redis Utilities
 * Helper functions for common Redis operations with error handling
 * Supports presence tracking, room management, and pub/sub operations
 */

import { Redis } from 'ioredis';
import { logger } from '@/config/logger';

export const REDIS_PREFIXES = {
    PRESENCE: 'user_presence:',
    ROOM_USERS: 'room_users:',
    ROOM_DATA: 'room_data:',
    MESSAGE_COUNT: 'message_count:',
    USER_ROOMS: 'user_rooms:',
};

export const REDIS_TTL = {
    PRESENCE: 3600, // 1 hour
    SESSION: 86400, // 24 hours
    TEMP_DATA: 300, // 5 minutes
};

/**
 * Set a key with TTL and error handling
 */
export async function redisSet(redis: Redis, key: string, value: any, ttl?: number): Promise<boolean> {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttl) {
            await redis.setex(key, ttl, stringValue);
        } else {
            await redis.set(key, stringValue);
        }

        logger.debug(`Redis SET: ${key}`);
        return true;
    } catch (error) {
        logger.error(`Redis SET failed for ${key}:`, error);
        return false;
    }
}

/**
 * Get a key and parse JSON if needed
 */
export async function redisGet<T = any>(redis: Redis, key: string, parseJson: boolean = true): Promise<T | null> {
    try {
        const value = await redis.get(key);

        if (!value) {
            return null;
        }

        if (parseJson) {
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        }

        return value as unknown as T;
    } catch (error) {
        logger.error(`Redis GET failed for ${key}:`, error);
        return null;
    }
}

/**
 * Delete a key
 */
export async function redisDel(redis: Redis, key: string | string[]): Promise<number> {
    try {
        const count = await redis.del(Array.isArray(key) ? key : [key]);
        logger.debug(`Redis DEL: ${Array.isArray(key) ? key.join(', ') : key} (${count} keys)`);
        return count;
    } catch (error) {
        logger.error(`Redis DEL failed:`, error);
        return 0;
    }
}

/**
 * Add member to a set
 */
export async function redisSetAdd(redis: Redis, key: string, member: string | string[]): Promise<number> {
    try {
        const members = Array.isArray(member) ? member : [member];
        const count = await redis.sadd(key, ...members);
        logger.debug(`Redis SADD: ${key} (${count} added)`);
        return count;
    } catch (error) {
        logger.error(`Redis SADD failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Remove member from a set
 */
export async function redisSetRemove(redis: Redis, key: string, member: string | string[]): Promise<number> {
    try {
        const members = Array.isArray(member) ? member : [member];
        const count = await redis.srem(key, ...members);
        logger.debug(`Redis SREM: ${key} (${count} removed)`);
        return count;
    } catch (error) {
        logger.error(`Redis SREM failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Get all members of a set
 */
export async function redisSetGetAll(redis: Redis, key: string): Promise<string[]> {
    try {
        const members = await redis.smembers(key);
        logger.debug(`Redis SMEMBERS: ${key} (${members.length} members)`);
        return members;
    } catch (error) {
        logger.error(`Redis SMEMBERS failed for ${key}:`, error);
        return [];
    }
}

/**
 * Check if member exists in set
 */
export async function redisSetIsMember(redis: Redis, key: string, member: string): Promise<boolean> {
    try {
        const isMember = await redis.sismember(key, member);
        return isMember === 1;
    } catch (error) {
        logger.error(`Redis SISMEMBER failed for ${key}:`, error);
        return false;
    }
}

/**
 * Get set cardinality (number of members)
 */
export async function redisSetCount(redis: Redis, key: string): Promise<number> {
    try {
        const count = await redis.scard(key);
        return count;
    } catch (error) {
        logger.error(`Redis SCARD failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Increment a counter
 */
export async function redisIncrement(redis: Redis, key: string, amount: number = 1): Promise<number> {
    try {
        const value = await redis.incrby(key, amount);
        logger.debug(`Redis INCRBY: ${key} += ${amount}`);
        return value;
    } catch (error) {
        logger.error(`Redis INCRBY failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Append to a string
 */
export async function redisAppend(redis: Redis, key: string, value: string): Promise<number> {
    try {
        const length = await redis.append(key, value);
        logger.debug(`Redis APPEND: ${key}`);
        return length;
    } catch (error) {
        logger.error(`Redis APPEND failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Get keys matching pattern
 */
export async function redisGetKeysByPattern(redis: Redis, pattern: string): Promise<string[]> {
    try {
        const keys = await redis.keys(pattern);
        logger.debug(`Redis KEYS: ${pattern} (${keys.length} found)`);
        return keys;
    } catch (error) {
        logger.error(`Redis KEYS failed for pattern ${pattern}:`, error);
        return [];
    }
}

/**
 * Batch delete keys by pattern
 */
export async function redisDeleteByPattern(redis: Redis, pattern: string): Promise<number> {
    try {
        const keys = await redis.keys(pattern);

        if (keys.length === 0) {
            return 0;
        }

        const count = await redis.del(...keys);
        logger.info(`Redis DELETE by pattern: ${pattern} (${count} keys deleted)`);
        return count;
    } catch (error) {
        logger.error(`Redis DELETE by pattern failed for ${pattern}:`, error);
        return 0;
    }
}

/**
 * Check if key exists
 */
export async function redisExists(redis: Redis, key: string | string[]): Promise<number> {
    try {
        const keys = Array.isArray(key) ? key : [key];
        const count = await redis.exists(...keys);
        return count;
    } catch (error) {
        logger.error(`Redis EXISTS failed:`, error);
        return 0;
    }
}

/**
 * Publish a message to a channel
 */
export async function redisPublish(redis: Redis, channel: string, message: any): Promise<number> {
    try {
        const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
        const numReceivers = await redis.publish(channel, stringMessage);
        logger.debug(`Redis PUBLISH: ${channel} (${numReceivers} receivers)`);
        return numReceivers;
    } catch (error) {
        logger.error(`Redis PUBLISH failed for ${channel}:`, error);
        return 0;
    }
}
