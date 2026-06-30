/**
 * Socket.IO Types
 * Centralized TypeScript interfaces for all Socket.IO events, responses, and data structures
 */

import type { UserRole } from '@interfaces/roles';

export interface SocketUser {
    userId: string;
    email: string;
    role: UserRole;
}

export interface SocketData {
    user?: SocketUser;
    rooms?: Set<string>;
}

/**
 * ===== MESSAGE EVENTS =====
 * Events related to messaging
 */

export interface SendMessagePayload {
    roomId: string;
    text: string;
    createdAt?: Date;
}

export interface CreateRoomPayload {
    name: string;
    description?: string;
}

export interface GetRoomPayload {
    roomId: string;
}

export interface GetRoomMessagesPayload {
    roomId: string;
    limit?: number;
    offset?: number;
}

export interface MessageResponse {
    messageId: string;
    sender: SocketUser;
    text: string;
    roomId: string;
    createdAt: Date;
}

export interface RoomInfo {
    roomId: string;
    name: string;
    description?: string;
    createdAt: Date;
    memberCount: number;
}

export interface ChatMessage {
    messageId: string;
    roomId: string;
    sender: SocketUser;
    text: string;
    createdAt: Date;
}

/**
 * ===== ROOM EVENTS =====
 * Events related to room management
 */

export interface JoinRoomPayload {
    roomId: string;
}

export interface LeaveRoomPayload {
    roomId: string;
}

export interface RoomJoinedResponse {
    roomId: string;
    userId: string;
    timestamp: Date;
    room?: RoomInfo;
}

export interface RoomLeftResponse {
    roomId: string;
    userId: string;
    timestamp: Date;
}

export interface RoomCreatedResponse {
    room: RoomInfo;
    timestamp: Date;
}

export interface RoomMessagesResponse {
    roomId: string;
    messages: ChatMessage[];
    total: number;
}

/**
 * ===== PRESENCE EVENTS =====
 * Events related to user presence and online status
 */

export interface UserPresence {
    userId: string;
    email: string;
    username: string;
    rooms: string[];
    connectedAt: Date;
    lastSeen: Date;
}

export interface PresenceUpdate {
    userId: string;
    rooms: string[];
    timestamp: Date;
}

/**
 * ===== ERROR RESPONSES =====
 * Standardized error format for Socket.IO events
 */

export interface SocketErrorResponse {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
}

export enum SocketErrorCode {
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_PAYLOAD = 'INVALID_PAYLOAD',
    ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    ALREADY_IN_ROOM = 'ALREADY_IN_ROOM',
    NOT_IN_ROOM = 'NOT_IN_ROOM',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * ===== ACKNOWLEDGMENT RESPONSES =====
 * For ACK callbacks on event emissions
 */

export interface AckResponse<T = any> {
    success: boolean;
    data?: T;
    error?: SocketErrorResponse;
}
