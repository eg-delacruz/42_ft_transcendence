import { randomUUID } from 'crypto';

import { Redis } from 'ioredis';

import { ChatMessage, CreateRoomPayload, GetRoomMessagesPayload, RoomInfo, SocketUser } from '@/types/socket';
import { SocketService } from '@/utils/socket.service';
import { logger } from '@/config/logger';

const CHAT_ROOM_PREFIX = 'chat:room:';
const CHAT_ROOM_INDEX = 'chat:rooms';
const CHAT_ROOM_MESSAGES_PREFIX = 'chat:room:messages:';
const CHAT_ROOM_MESSAGE_LIMIT = 200;

export class ChatService {
    static readonly GLOBAL_ROOM_ID = 'global';

    constructor(
        private readonly redis: Redis,
        private readonly socketService: SocketService,
    ) {}

    private roomKey(roomId: string): string {
        return `${CHAT_ROOM_PREFIX}${roomId}`;
    }

    private roomMessagesKey(roomId: string): string {
        return `${CHAT_ROOM_MESSAGES_PREFIX}${roomId}`;
    }

    private serializeRoom(room: RoomInfo): string {
        return JSON.stringify(room);
    }

    private parseRoom(rawRoom: string | null): RoomInfo | null {
        if (!rawRoom) {
            return null;
        }

        try {
            const parsed = JSON.parse(rawRoom) as RoomInfo;
            return {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
            };
        } catch (error) {
            logger.error('Failed to parse room payload', error);
            return null;
        }
    }

    private parseMessage(rawMessage: string): ChatMessage | null {
        try {
            const parsed = JSON.parse(rawMessage) as ChatMessage;
            return {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
            };
        } catch (error) {
            logger.error('Failed to parse message payload', error);
            return null;
        }
    }

    async createRoom(payload: CreateRoomPayload): Promise<RoomInfo> {
        const roomId = randomUUID();
        const room: RoomInfo = {
            roomId,
            name: payload.name.trim(),
            description: payload.description?.trim() || undefined,
            createdAt: new Date(),
            memberCount: 0,
        };

        await this.redis.set(this.roomKey(roomId), this.serializeRoom(room));
        await this.redis.sadd(CHAT_ROOM_INDEX, roomId);

        logger.info(`Chat room created: ${roomId} (${room.name})`);
        return room;
    }

    async getRoom(roomId: string): Promise<RoomInfo | null> {
        const room = this.parseRoom(await this.redis.get(this.roomKey(roomId)));
        if (!room) {
            return null;
        }

        const memberCount = await this.socketService.getRoomUsers(roomId).then((users) => users.length);
        return {
            ...room,
            memberCount,
        };
    }

    async getRooms(): Promise<RoomInfo[]> {
        const roomIds = await this.redis.smembers(CHAT_ROOM_INDEX);
        const rooms: RoomInfo[] = [];

        for (const roomId of roomIds) {
            const room = await this.getRoom(roomId);
            if (room) {
                rooms.push(room);
            }
        }

        return rooms.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    }

    async saveMessage(roomId: string, sender: SocketUser, text: string): Promise<ChatMessage> {
        const message: ChatMessage = {
            messageId: randomUUID(),
            roomId,
            sender,
            text: text.trim(),
            createdAt: new Date(),
        };

        const key = this.roomMessagesKey(roomId);
        await this.redis.rpush(key, JSON.stringify(message));
        await this.redis.ltrim(key, -CHAT_ROOM_MESSAGE_LIMIT, -1);

        logger.info(`Message saved for room ${roomId} from ${sender.userId}`);
        return message;
    }

    async getRoomMessages(payload: GetRoomMessagesPayload): Promise<ChatMessage[]> {
        const key = this.roomMessagesKey(payload.roomId);
        const limit = payload.limit ?? 50;
        const offset = payload.offset ?? 0;
        const end = offset + limit - 1;
        const rawMessages = await this.redis.lrange(key, offset, end);

        return rawMessages
            .map((rawMessage) => this.parseMessage(rawMessage))
            .filter((message): message is ChatMessage => message !== null);
    }

    async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
        const key = this.roomMessagesKey(roomId);
        const rawMessages = await this.redis.lrange(key, 0, -1);
        const targetMessage = rawMessages.find((rawMessage) => {
            const parsed = this.parseMessage(rawMessage);
            return parsed?.messageId === messageId;
        });

        if (!targetMessage) {
            return false;
        }

        const removedCount = await this.redis.lrem(key, 1, targetMessage);
        return removedCount > 0;
    }

    async updateRoomMemberCount(roomId: string): Promise<number> {
        const room = await this.getRoom(roomId);
        if (!room) {
            return 0;
        }

        const memberCount = await this.socketService.getRoomUsers(roomId).then((users) => users.length);
        await this.redis.set(this.roomKey(roomId), this.serializeRoom({ ...room, memberCount }));
        return memberCount;
    }

    async roomExists(roomId: string): Promise<boolean> {
        return (await this.redis.exists(this.roomKey(roomId))) === 1;
    }

    async ensureGlobalRoom(): Promise<RoomInfo> {
        const exists = await this.roomExists(ChatService.GLOBAL_ROOM_ID);
        if (exists) {
            const existingRoom = await this.getRoom(ChatService.GLOBAL_ROOM_ID);
            if (existingRoom) {
                return existingRoom;
            }
        }

        const room: RoomInfo = {
            roomId: ChatService.GLOBAL_ROOM_ID,
            name: 'Global Chat',
            description: 'Default global chat room',
            createdAt: new Date(),
            memberCount: 0,
        };

        await this.redis.set(this.roomKey(ChatService.GLOBAL_ROOM_ID), this.serializeRoom(room));
        await this.redis.sadd(CHAT_ROOM_INDEX, ChatService.GLOBAL_ROOM_ID);

        logger.info(`Global chat room ensured: ${ChatService.GLOBAL_ROOM_ID}`);
        return room;
    }
}
