/**
 * Socket Event Validation Middleware
 * Validates Socket.IO event payloads against schemas
 * Provides consistent error handling for malformed events
 */

import { Socket } from 'socket.io';
import { AckResponse, SocketErrorCode, SocketErrorResponse } from '@/types/socket';
import { logger } from '@/config/logger';

export interface EventSchema {
    [key: string]: FieldValidator;
}

export interface FieldValidator {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: any) => boolean;
}

/**
 * Validate a payload against a schema
 */
export function validatePayload(payload: any, schema: EventSchema): { valid: boolean; error?: string } {
    if (!payload) {
        return { valid: false, error: 'Payload is empty' };
    }

    for (const [field, validator] of Object.entries(schema)) {
        const value = payload[field];

        // Check required
        if (validator.required && (value === undefined || value === null)) {
            return { valid: false, error: `Missing required field: ${field}` };
        }

        // Skip if not required and missing
        if (!validator.required && (value === undefined || value === null)) {
            continue;
        }

        // Check type
        if (typeof value !== validator.type) {
            return { valid: false, error: `Field ${field} must be of type ${validator.type}` };
        }

        // Check string constraints
        if (validator.type === 'string') {
            if (validator.minLength && value.length < validator.minLength) {
                return { valid: false, error: `Field ${field} must be at least ${validator.minLength} characters` };
            }
            if (validator.maxLength && value.length > validator.maxLength) {
                return { valid: false, error: `Field ${field} must be at most ${validator.maxLength} characters` };
            }
            if (validator.pattern && !validator.pattern.test(value)) {
                return { valid: false, error: `Field ${field} does not match required pattern` };
            }
        }

        // Custom validation
        if (validator.validate && !validator.validate(value)) {
            return { valid: false, error: `Field ${field} failed custom validation` };
        }
    }

    return { valid: true };
}

/**
 * Create a validated event handler wrapper
 * Automatically validates payload and sends error response if invalid
 */
export function createValidatedHandler<T>(
    schema: EventSchema,
    handler: (payload: T, socket: Socket, callback?: (response: AckResponse) => void) => Promise<void>,
) {
    return async (payload: T, socket: Socket, callback?: (response: AckResponse) => void) => {
        const validation = validatePayload(payload, schema);

        if (!validation.valid) {
            logger.warn(`Event validation failed: ${validation.error}`);
            if (callback) {
                callback({
                    success: false,
                    error: {
                        code: SocketErrorCode.INVALID_PAYLOAD,
                        message: validation.error || 'Invalid payload',
                        timestamp: new Date(),
                    },
                });
            }
            return;
        }

        try {
            await handler(payload, socket, callback);
        } catch (error) {
            logger.error('Error in validated handler:', error);
            if (callback) {
                callback({
                    success: false,
                    error: {
                        code: SocketErrorCode.INTERNAL_ERROR,
                        message: 'Internal server error',
                        timestamp: new Date(),
                    },
                });
            }
        }
    };
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
    joinRoom: {
        roomId: { type: 'string', required: true, minLength: 1, maxLength: 255 },
    } as EventSchema,

    leaveRoom: {
        roomId: { type: 'string', required: true, minLength: 1, maxLength: 255 },
    } as EventSchema,

    sendMessage: {
        roomId: { type: 'string', required: true, minLength: 1, maxLength: 255 },
        text: { type: 'string', required: true, minLength: 1, maxLength: 5000 },
    } as EventSchema,
};
