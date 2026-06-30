import { Socket } from 'socket.io';

import {
    AckResponse,
    ChatMessage,
    CreateRoomPayload,
    GetRoomMessagesPayload,
    GetRoomPayload,
    JoinRoomPayload,
    LeaveRoomPayload,
    MessageResponse,
    RoomCreatedResponse,
    RoomInfo,
    RoomJoinedResponse,
    RoomLeftResponse,
    RoomMessagesResponse,
    SendMessagePayload,
    SocketErrorCode,
} from '@/types/socket';
import { SocketService } from '@/utils/socket.service';
import { CommonSchemas, validatePayload } from '@/utils/socket-validation';
import { ChatService } from './chat.service';
import { logger } from '@/config/logger';

// ─── Helpers ────────────────────────────────────────────────────────────────

function createAckError(
    code: SocketErrorCode,
    message: string,
    details?: Record<string, any>,
): AckResponse {
    return {
        success: false,
        error: SocketService.createError(code, message, details),
    };
}

function getSocketUser(socket: Socket) {
    return socket.data.user;
}

function getJoinedRoomIds(socket: Socket): string[] {
    const rooms = socket.data.rooms ?? new Set<string>();
    return Array.from(rooms);
}

function addJoinedRoom(socket: Socket, roomId: string): void {
    if (!socket.data.rooms) {
        socket.data.rooms = new Set<string>();
    }
    socket.data.rooms.add(roomId);
}

function removeJoinedRoom(socket: Socket, roomId: string): void {
    socket.data.rooms?.delete(roomId);
}

// ─── Handler setup ───────────────────────────────────────────────────────────

export function setupChatHandlers(
    socket: Socket,
    socketService: SocketService,
    chatService: ChatService,
): void {

    // ── get_rooms ────────────────────────────────────────────────────────────
    // Returns the full list of rooms. Called by the frontend on connect.
    socket.on(
        'get_rooms',
        async (_payload: object, callback?: (response: AckResponse<{ rooms: RoomInfo[] }>) => void) => {
            try {
                const rooms = await chatService.getRooms();
                callback?.({ success: true, data: { rooms } });
            } catch (error) {
                logger.error('Error in get_rooms handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to get rooms'));
            }
        },
    );

    // ── create_room ──────────────────────────────────────────────────────────
    socket.on(
        'create_room',
        async (
            payload: CreateRoomPayload,
            callback?: (response: AckResponse<RoomCreatedResponse>) => void,
        ) => {
            const validation = validatePayload(payload, {
                name: { type: 'string', required: true, minLength: 1, maxLength: 80 },
                description: { type: 'string', required: false, maxLength: 250 },
            });

            if (!validation.valid) {
                callback?.(createAckError(SocketErrorCode.INVALID_PAYLOAD, validation.error ?? 'Invalid payload'));
                return;
            }

            try {
                const room = await chatService.createRoom(payload);
                callback?.({ success: true, data: { room, timestamp: new Date() } });
            } catch (error) {
                logger.error('Error in create_room handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to create room'));
            }
        },
    );

    // ── get_room ─────────────────────────────────────────────────────────────
    socket.on(
        'get_room',
        async (
            payload: GetRoomPayload,
            callback?: (response: AckResponse<RoomInfo>) => void,
        ) => {
            const validation = validatePayload(payload, CommonSchemas.joinRoom);

            if (!validation.valid) {
                callback?.(createAckError(SocketErrorCode.INVALID_PAYLOAD, validation.error ?? 'Invalid payload'));
                return;
            }

            try {
                const room = await chatService.getRoom(payload.roomId);
                if (!room) {
                    callback?.(createAckError(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
                    return;
                }
                callback?.({ success: true, data: room });
            } catch (error) {
                logger.error('Error in get_room handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to get room'));
            }
        },
    );

    // ── get_room_messages ────────────────────────────────────────────────────
    socket.on(
        'get_room_messages',
        async (
            payload: GetRoomMessagesPayload,
            callback?: (response: AckResponse<RoomMessagesResponse>) => void,
        ) => {
            const validation = validatePayload(payload, CommonSchemas.joinRoom);

            if (!validation.valid) {
                callback?.(createAckError(SocketErrorCode.INVALID_PAYLOAD, validation.error ?? 'Invalid payload'));
                return;
            }

            try {
                const messages = await chatService.getRoomMessages(payload);
                callback?.({
                    success: true,
                    data: { roomId: payload.roomId, messages, total: messages.length },
                });
            } catch (error) {
                logger.error('Error in get_room_messages handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to get room messages'));
            }
        },
    );

    // ── join_room ────────────────────────────────────────────────────────────
    socket.on(
        'join_room',
        async (
            payload: JoinRoomPayload,
            callback?: (response: AckResponse<RoomJoinedResponse>) => void,
        ) => {
            const validation = validatePayload(payload, CommonSchemas.joinRoom);

            if (!validation.valid) {
                callback?.(createAckError(SocketErrorCode.INVALID_PAYLOAD, validation.error ?? 'Invalid payload'));
                return;
            }

            try {
                const user = getSocketUser(socket);
                if (!user) {
                    callback?.(createAckError(SocketErrorCode.UNAUTHORIZED, 'User not authenticated'));
                    return;
                }

                const room = await chatService.getRoom(payload.roomId);
                if (!room) {
                    callback?.(createAckError(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
                    return;
                }

                if (socket.data.rooms?.has(payload.roomId)) {
                    callback?.(createAckError(SocketErrorCode.ALREADY_IN_ROOM, 'Already in this room'));
                    return;
                }

                socket.join(payload.roomId);
                socket.join(`user:${user.userId}`);
                addJoinedRoom(socket, payload.roomId);

                await socketService.addUserToRoom(user.userId, payload.roomId);
                await socketService.updateUserPresence(user, getJoinedRoomIds(socket));
                await chatService.updateRoomMemberCount(payload.roomId);

                // Refresh room to get updated memberCount
                const updatedRoom = (await chatService.getRoom(payload.roomId)) ?? room;

                socketService.broadcastToRoom(payload.roomId, 'room:user_joined', {
                    roomId: payload.roomId,
                    user,
                    timestamp: new Date(),
                });

                callback?.({
                    success: true,
                    data: {
                        roomId: payload.roomId,
                        userId: user.userId,
                        timestamp: new Date(),
                        room: updatedRoom,
                    },
                });
            } catch (error) {
                logger.error('Error in join_room handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to join room'));
            }
        },
    );

    // ── send_message ─────────────────────────────────────────────────────────
    socket.on(
        'send_message',
        async (
            payload: SendMessagePayload,
            callback?: (response: AckResponse<MessageResponse>) => void,
        ) => {
            // Default to the global room when no roomId is provided
            const messagePayload: SendMessagePayload = {
                ...payload,
                roomId: payload.roomId?.trim() || ChatService.GLOBAL_ROOM_ID,
            };

            const validation = validatePayload(messagePayload, CommonSchemas.sendMessage);

            if (!validation.valid) {
                callback?.(createAckError(SocketErrorCode.INVALID_PAYLOAD, validation.error ?? 'Invalid payload'));
                return;
            }

            try {
                const user = getSocketUser(socket);
                if (!user) {
                    callback?.(createAckError(SocketErrorCode.UNAUTHORIZED, 'User not authenticated'));
                    return;
                }

                if (!socket.data.rooms?.has(messagePayload.roomId)) {
                    callback?.(createAckError(SocketErrorCode.NOT_IN_ROOM, 'Not in this room'));
                    return;
                }

                const room = await chatService.getRoom(messagePayload.roomId);
                if (!room) {
                    callback?.(createAckError(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
                    return;
                }

                const message = await chatService.saveMessage(messagePayload.roomId, user, messagePayload.text);
                const response: MessageResponse = {
                    messageId: message.messageId,
                    sender: message.sender,
                    text: message.text,
                    roomId: messagePayload.roomId,
                    createdAt: message.createdAt,
                };

                // Broadcast to everyone in room (including sender)
                socketService.broadcastToRoom(messagePayload.roomId, 'message:new', response);
                await socketService.updateUserPresence(user, getJoinedRoomIds(socket));

                callback?.({ success: true, data: response });
            } catch (error) {
                logger.error('Error in send_message handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to send message'));
            }
        },
    );

    // ── leave_room ───────────────────────────────────────────────────────────
    socket.on(
        'leave_room',
        async (
            payload: LeaveRoomPayload,
            callback?: (response: AckResponse<RoomLeftResponse>) => void,
        ) => {
            const validation = validatePayload(payload, CommonSchemas.leaveRoom);

            if (!validation.valid) {
                callback?.(createAckError(SocketErrorCode.INVALID_PAYLOAD, validation.error ?? 'Invalid payload'));
                return;
            }

            try {
                const user = getSocketUser(socket);
                if (!user) {
                    callback?.(createAckError(SocketErrorCode.UNAUTHORIZED, 'User not authenticated'));
                    return;
                }

                if (!socket.data.rooms?.has(payload.roomId)) {
                    callback?.(createAckError(SocketErrorCode.NOT_IN_ROOM, 'Not in this room'));
                    return;
                }

                socket.leave(payload.roomId);
                removeJoinedRoom(socket, payload.roomId);

                await socketService.removeUserFromRoom(user.userId, payload.roomId);
                await socketService.updateUserPresence(user, getJoinedRoomIds(socket));
                await chatService.updateRoomMemberCount(payload.roomId);

                socketService.broadcastToRoom(payload.roomId, 'room:user_left', {
                    roomId: payload.roomId,
                    user,
                    timestamp: new Date(),
                });

                callback?.({
                    success: true,
                    data: { roomId: payload.roomId, userId: user.userId, timestamp: new Date() },
                });
            } catch (error) {
                logger.error('Error in leave_room handler:', error);
                callback?.(createAckError(SocketErrorCode.INTERNAL_ERROR, 'Failed to leave room'));
            }
        },
    );

    // ── typing / stop_typing ─────────────────────────────────────────────────
    socket.on('typing', (roomId: string) => {
        try {
            const user = getSocketUser(socket);
            if (!user || !socket.data.rooms?.has(roomId)) return;

            socketService.broadcastToRoom(roomId, 'room:typing', {
                roomId,
                user,
                timestamp: new Date(),
            });
        } catch (error) {
            logger.error('Error in typing handler:', error);
        }
    });

    socket.on('stop_typing', (roomId: string) => {
        try {
            const user = getSocketUser(socket);
            if (!user || !socket.data.rooms?.has(roomId)) return;

            socketService.broadcastToRoom(roomId, 'room:stop_typing', {
                roomId,
                user,
                timestamp: new Date(),
            });
        } catch (error) {
            logger.error('Error in stop_typing handler:', error);
        }
    });
}
