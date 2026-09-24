/**
 * Socket Service
 * Business logic for Socket.IO operations (presence, rooms, users, matchmaking)
 * Abstracts Redis operations and Socket.IO instance interactions
 */

import { Namespace, Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import {
    MatchFoundPayload,
    GameActionPayload,
    GameActionBroadcast,
    GameStatePayload,
    UserPresence,
    SocketUser,
    SocketErrorCode,
    SocketErrorResponse,
} from '@/types/socket';
import type { GameName } from '@/types/games';
import { logger } from '@/config/logger';

const PRESENCE_PREFIX = 'user_presence:';
const ROOM_USERS_PREFIX = 'room_users:';
const MATCHMAKING_QUEUE_KEY = 'matchmaking:queue';
const MATCHMAKING_MEMBERS_KEY = 'matchmaking:members';
const ACTIVE_MATCH_KEY = 'matchmaking:active';
const MATCHMAKING_LOCK_KEY = 'matchmaking:lock';
const GAME_STATE_KEY = 'matchmaking:game-state';
const GAME_STATE_LOCK_KEY = 'matchmaking:game-state-lock';
const GAME_ROOM_ID = 'global';
const PRESENCE_TTL = 3600; // 1 hour

type MatchmakingResult = {
    payload?: MatchFoundPayload;
    created: boolean;
};

type FightAction = 'punch' | 'kick' | 'grab' | 'dodge';
type FightResultType = 'player1Wins' | 'player2Wins' | 'draw' | 'noDamage';
type FightPlayer = {
    id: 'player1' | 'player2';
    name: string;
    health: number;
    score: number;
    selectedAction?: FightAction;
    previousAction?: FightAction;
    consecutiveWins: number;
};
type FightState = {
    phase: 'bettingCountdown' | 'selecting' | 'resolving' | 'finished';
    round: number;
    bettingCountdown: number;
    selectionTimeLeft: number;
    resolutionTimeLeft: number;
    resultsCountdown: number;
    player1: FightPlayer;
    player2: FightPlayer;
    lastRoundResult?: {
        resultType: FightResultType;
        player1Damage: number;
        player2Damage: number;
        player1ScoreGain: number;
        player2ScoreGain: number;
        message: string;
    };
    winnerId?: 'player1' | 'player2';
};
type DungeonCard = {
    id: string;
    name: string;
    probability: number;
    effects: string[];
    icon: string;
};
type DungeonRoom = {
    type: 'combat' | 'trap' | 'empty';
    name: string;
    probability: number;
    icon: string;
};
type DungeonState = {
    phase: 'bettingCountdown' | 'choosingClass' | 'choosingCard' | 'resolvingRoom' | 'escaped' | 'dead';
    bettingCountdown: number;
    classSelectionCountdown: number;
    cardSelectionCountdown: number;
    resolveCountdown: number;
    resultsCountdown: number;
    player: { class?: 'mague' | 'rogue' | 'warrior'; health: number; score: number; streak: number; roundsSurvived: number };
    currentRoom?: DungeonRoom;
    hand: DungeonCard[];
    lastTurnResult?: { roomCleared: boolean; damageTaken: number; healingReceived: number; scoreGained: number; message: string };
};

export class SocketService {
    private io: Server | Namespace;
    private redis: Redis;

    constructor(io: Server | Namespace, redis: Redis) {
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
                userId: user.userId,
                email: user.email,
                username: user.email,
                rooms,
                connectedAt: new Date(),
                lastSeen: new Date(),
            };

            const key = `${PRESENCE_PREFIX}${user.userId}`;
            await this.redis.setex(key, PRESENCE_TTL, JSON.stringify(presence));

            logger.debug(`User presence added: ${user.userId} in rooms ${rooms.join(', ')}`);
        } catch (error) {
            logger.error(`Error adding user presence for ${user.userId}:`, error);
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
                userId: user.userId,
                email: user.email,
                username: user.email,
                rooms,
                connectedAt: new Date(),
                lastSeen: new Date(),
            };

            const key = `${PRESENCE_PREFIX}${user.userId}`;
            await this.redis.setex(key, PRESENCE_TTL, JSON.stringify(presence));

            logger.debug(`User presence updated: ${user.userId} in rooms ${rooms.join(', ')}`);
        } catch (error) {
            logger.error(`Error updating user presence for ${user.userId}:`, error);
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

    broadcastMatchmakingLog(message: string, details: Record<string, unknown> = {}): void {
        const payload = { message, details, timestamp: new Date().toISOString() };
        logger.info(`[matchmaking] ${message} ${JSON.stringify(details)}`);
        this.broadcastToRoom(GAME_ROOM_ID, 'matchmaking:log', payload);
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
    static createError(
        code: SocketErrorCode | string, 
        message: string, 
        details?: Record<string, any>
    ): SocketErrorResponse {
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

    /**
     * Matchmaking: Add user to queue and try to match immediately
     */
    async joinMatchmaking(user: SocketUser, socketId: string): Promise<MatchmakingResult> {
        try {
            const activeMatch = await this.getActiveGame();
            if (activeMatch) {
                await this.redis.sadd(MATCHMAKING_MEMBERS_KEY, user.userId);
                await this.addUserToRoom(user.userId, GAME_ROOM_ID);
                const users = await this.getActiveMatchmakingUsers();
                this.broadcastMatchmakingLog('Usuario entra como espectador de la partida activa', { userId: user.userId, users });
                return { payload: activeMatch, created: false };
            }

            const isNewMember = (await this.redis.sadd(MATCHMAKING_MEMBERS_KEY, user.userId)) === 1;
            if (isNewMember) {
                await this.redis.rpush(
                    MATCHMAKING_QUEUE_KEY,
                    JSON.stringify({ userId: user.userId, socketId, timestamp: Date.now() }),
                );
            }

            const users = await this.getActiveMatchmakingUsers();
            this.broadcastMatchmakingLog('Usuario entra en la sala global', { userId: user.userId, users });
            const match = await this.tryCreateMatch();
            if (match) {
                await this.addUserToRoom(user.userId, GAME_ROOM_ID);
                return { payload: match.payload, created: match.created };
            }

            await this.addUserToRoom(user.userId, GAME_ROOM_ID);
            logger.debug(`User ${user.userId} joined the global matchmaking room`);
            return { created: false };
        } catch (error) {
            logger.error(`Error in joinMatchmaking for user ${user.userId}:`, error);
            return { created: false };
        }
    }

    async validateGameAction(
        userId: string,
        payload: GameActionPayload,
    ): Promise<GameActionBroadcast | null> {
        const activeMatch = await this.getActiveGame();
        if (!activeMatch || payload.roomId !== GAME_ROOM_ID || payload.game !== activeMatch.game) {
            return null;
        }

        const participant = activeMatch.players.find((player) => player.userId === userId);
        if (!participant || participant.role === 'spectator') {
            return null;
        }

        if (!this.isAllowedAction(payload)) {
            return null;
        }

        return {
            ...payload,
            userId,
            role: participant.role,
            timestamp: Date.now(),
        };
    }

    async getGameState(): Promise<GameStatePayload | null> {
        const rawState = await this.redis.get(GAME_STATE_KEY);
        return rawState ? JSON.parse(rawState) as GameStatePayload : null;
    }

    async ensureGameState(): Promise<GameStatePayload | null> {
        const activeMatch = await this.getActiveGame();
        if (!activeMatch) return null;

        const currentState = await this.getGameState();
        if (currentState?.game === activeMatch.game) return currentState;

        if (activeMatch.game === 'fight_fight') {
            const state: GameStatePayload = {
                roomId: GAME_ROOM_ID,
                game: 'fight_fight',
                state: this.createFightState(),
                timestamp: Date.now(),
            };
            await this.redis.set(GAME_STATE_KEY, JSON.stringify(state));
            return state;
        }

        if (activeMatch.game === 'deep_&_dark') {
            const state: GameStatePayload = {
                roomId: GAME_ROOM_ID,
                game: 'deep_&_dark',
                state: this.createDungeonState(),
                timestamp: Date.now(),
            };
            await this.redis.set(GAME_STATE_KEY, JSON.stringify(state));
            return state;
        }

        if (activeMatch.game !== 'the_race') return null;

        const state: GameStatePayload = {
            roomId: GAME_ROOM_ID,
            game: 'the_race',
            state: {
                phase: 'bettingCountdown',
                bettingCountdown: 3,
                gameCountdown: 3,
                resultsCountdown: 3,
                players: [
                    { id: 'player1', name: 'Player 1', progress: 0 },
                    { id: 'player2', name: 'Player 2', progress: 0 },
                ],
            },
            timestamp: Date.now(),
        };
        await this.redis.set(GAME_STATE_KEY, JSON.stringify(state));
        return state;
    }

    async applyGameAction(userId: string, payload: GameActionPayload): Promise<{
        action: GameActionBroadcast;
        state?: GameStatePayload;
    } | null> {
        const action = await this.validateGameAction(userId, payload);
        if (!action) return null;

            if (payload.game === 'fight_fight') {
                const currentState = await this.ensureGameState();
                if (!currentState) return null;
                const fightState = currentState.state as FightState;
                if (fightState.phase !== 'selecting') return null;
                const player = action.role === 'player1' ? fightState.player1 : fightState.player2;
                if (payload.action === 'dodge' && player.previousAction === 'dodge') return null;
                player.selectedAction = payload.action as FightAction;
                const nextState = { ...currentState, state: fightState, timestamp: Date.now() };
                await this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
                return { action, state: nextState };
            }

            if (payload.game === 'deep_&_dark') {
                const currentState = await this.ensureGameState();
                if (!currentState) return null;
                const dungeonState = currentState.state as DungeonState;
                const nextState = this.applyDungeonAction(dungeonState, payload.action as string);
                if (!nextState) return null;
                const state = { ...currentState, state: nextState, timestamp: Date.now() };
                await this.redis.set(GAME_STATE_KEY, JSON.stringify(state));
                return { action, state };
            }

            if (payload.game !== 'the_race') return { action };

        const lockToken = `${Date.now()}-${Math.random()}`;
        const lockAcquired = await this.redis.set(GAME_STATE_LOCK_KEY, lockToken, 'EX', 5, 'NX');
        if (!lockAcquired) return null;

        try {
            const currentState = await this.ensureGameState();
            if (!currentState) return null;
            const raceState = currentState.state as {
                phase: string;
                players: { id: 'player1' | 'player2'; name: string; progress: number }[];
                winnerId?: 'player1' | 'player2';
                bettingCountdown: number;
                gameCountdown: number;
                resultsCountdown: number;
            };
            if (raceState.phase !== 'running') return null;

            const playerId = action.role === 'player1' ? 'player1' : 'player2';
            const player = raceState.players.find((candidate) => candidate.id === playerId);
            if (!player) return null;
            player.progress = Math.min(player.progress + 1, 100);
            if (player.progress >= 100) {
                raceState.phase = 'finished';
                raceState.winnerId = playerId;
                raceState.resultsCountdown = 3;
            }
            const nextState = { ...currentState, state: raceState, timestamp: Date.now() };
            await this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
            return { action, state: nextState };
        } finally {
            const currentToken = await this.redis.get(GAME_STATE_LOCK_KEY);
            if (currentToken === lockToken) await this.redis.del(GAME_STATE_LOCK_KEY);
        }
    }

    async tickGameState(): Promise<GameStatePayload | null> {
        const currentState = await this.getGameState();
        if (!currentState) return null;
        if (currentState.game === 'fight_fight') return this.tickFightState(currentState);
        if (currentState.game === 'deep_&_dark') return this.tickDungeonState(currentState);
        if (currentState.game !== 'the_race') return null;
        const raceState = currentState.state as {
            phase: string;
            bettingCountdown: number;
            gameCountdown: number;
        };
        if (raceState.phase === 'bettingCountdown') {
            raceState.bettingCountdown -= 1;
            if (raceState.bettingCountdown <= 0) {
                raceState.phase = 'gameCountdown';
                raceState.bettingCountdown = 0;
            }
        } else if (raceState.phase === 'gameCountdown') {
            raceState.gameCountdown -= 1;
            if (raceState.gameCountdown <= 0) {
                raceState.phase = 'running';
                raceState.gameCountdown = 0;
            }
        } else {
            return null;
        }
        const nextState = { ...currentState, state: raceState, timestamp: Date.now() };
        await this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
        return nextState;
    }

    private createFightState(): FightState {
        return {
            phase: 'bettingCountdown',
            round: 1,
            bettingCountdown: 3,
            selectionTimeLeft: 3,
            resolutionTimeLeft: 1,
            resultsCountdown: 3,
            player1: this.createFightPlayer('player1'),
            player2: this.createFightPlayer('player2'),
        };
    }

    private createFightPlayer(id: 'player1' | 'player2'): FightPlayer {
        return { id, name: id === 'player1' ? 'Player 1' : 'Player 2', health: 100, score: 0, consecutiveWins: 0 };
    }

    private tickFightState(currentState: GameStatePayload): GameStatePayload | null {
        const state = currentState.state as FightState;
        if (state.phase === 'bettingCountdown') {
            state.bettingCountdown -= 1;
            if (state.bettingCountdown <= 0) {
                state.phase = 'selecting';
                state.bettingCountdown = 0;
                state.selectionTimeLeft = 3;
            }
        } else if (state.phase === 'selecting') {
            state.selectionTimeLeft -= 1;
            if (state.selectionTimeLeft <= 0) {
                this.resolveFightRound(state);
            }
        } else if (state.phase === 'resolving') {
            state.resolutionTimeLeft -= 1;
            if (state.resolutionTimeLeft <= 0) {
                if (state.player1.health <= 0 || state.player2.health <= 0) {
                    state.phase = 'finished';
                    state.winnerId = state.player1.health <= 0 && state.player2.health <= 0
                        ? state.player1.score >= state.player2.score ? 'player1' : 'player2'
                        : state.player1.health <= 0 ? 'player2' : 'player1';
                    state.resultsCountdown = 3;
                } else {
                    state.phase = 'selecting';
                    state.round += 1;
                    state.selectionTimeLeft = 3;
                    state.player1.selectedAction = undefined;
                    state.player2.selectedAction = undefined;
                }
            }
        } else {
            return null;
        }
        const nextState = { ...currentState, state, timestamp: Date.now() };
        void this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
        return nextState;
    }

    private resolveFightRound(state: FightState): void {
        const player1Action = state.player1.selectedAction ?? 'dodge';
        const player2Action = state.player2.selectedAction ?? 'dodge';
        let player1Damage = 0;
        let player2Damage = 0;
        let player1ScoreGain = 5;
        let player2ScoreGain = 5;
        let resultType: FightResultType = 'noDamage';

        if (player1Action === 'dodge' || player2Action === 'dodge') {
            resultType = 'noDamage';
        } else if (player1Action === player2Action) {
            player1ScoreGain += player1Action === 'grab' ? 1 : 1;
            player2ScoreGain += player1Action === 'grab' ? 1 : 1;
            if (player1Action !== 'grab') {
                player1Damage = Math.max(5 - (state.player1.health < 50 ? 1 : 0), 0);
                player2Damage = Math.max(5 - (state.player2.health < 50 ? 1 : 0), 0);
            }
            resultType = 'draw';
        } else {
            const player1Wins = (player1Action === 'punch' && player2Action === 'grab') ||
                (player1Action === 'kick' && player2Action === 'punch') ||
                (player1Action === 'grab' && player2Action === 'kick');
            const winningPlayer = player1Wins ? state.player1 : state.player2;
            const damage = 10 + (winningPlayer.consecutiveWins > 0 ? 2 : 0);
            if (player1Wins) {
                player2Damage = Math.max(damage - (state.player2.health < 50 ? 1 : 0), 0);
                player1ScoreGain += 2 + (state.player1.consecutiveWins > 0 ? 10 : 0);
                resultType = 'player1Wins';
            } else {
                player1Damage = Math.max(damage - (state.player1.health < 50 ? 1 : 0), 0);
                player2ScoreGain += 2 + (state.player2.consecutiveWins > 0 ? 10 : 0);
                resultType = 'player2Wins';
            }
        }

        state.player1.health = Math.max(state.player1.health - player1Damage, 0);
        state.player2.health = Math.max(state.player2.health - player2Damage, 0);
        state.player1.score += player1ScoreGain;
        state.player2.score += player2ScoreGain;
        state.player1.previousAction = player1Action;
        state.player2.previousAction = player2Action;
        state.player1.consecutiveWins = resultType === 'player1Wins' ? state.player1.consecutiveWins + 1 : 0;
        state.player2.consecutiveWins = resultType === 'player2Wins' ? state.player2.consecutiveWins + 1 : 0;
        state.lastRoundResult = {
            resultType,
            player1Damage,
            player2Damage,
            player1ScoreGain,
            player2ScoreGain,
            message: resultType === 'draw' ? 'Empate' : resultType === 'noDamage' ? 'Esquiva usada' : `${resultType} gana`,
        };
        state.phase = 'resolving';
        state.resolutionTimeLeft = 1;
    }

    private createDungeonState(): DungeonState {
        return {
            phase: 'bettingCountdown',
            bettingCountdown: 5,
            classSelectionCountdown: 5,
            cardSelectionCountdown: 3,
            resolveCountdown: 2,
            resultsCountdown: 2,
            player: { health: 5, score: 0, streak: 0, roundsSurvived: 0 },
            hand: [],
        };
    }

    private applyDungeonAction(state: DungeonState, key: string): DungeonState | null {
        if (state.phase === 'choosingClass') {
            const dungeonClass = key === 'ArrowLeft' ? 'mague' : key === 'ArrowRight' ? 'rogue' : key === 'ArrowUp' ? 'warrior' : null;
            if (!dungeonClass) return null;
            return { ...state, phase: 'choosingCard', player: { ...state.player, class: dungeonClass }, currentRoom: this.createDungeonRoom(), hand: this.createDungeonHand() };
        }
        if (state.phase !== 'choosingCard') return null;
        if (key === 'ArrowDown') return { ...state, phase: 'escaped', resultsCountdown: 2 };
        const cardIndex = key === 'ArrowLeft' ? 0 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? 2 : -1;
        if (cardIndex < 0) return null;
        const card = state.hand[cardIndex] ?? state.hand[0];
        const room = state.currentRoom;
        if (!card || !room) return null;
        const cleared = room.type === 'empty' || card.effects.includes('clearAll') || card.effects.includes(`clear${room.type === 'combat' ? 'Combat' : 'Trap'}`);
        const damage = cleared ? 0 : 1;
        const health = Math.max(state.player.health - damage, 0);
        return {
            ...state,
            phase: health <= 0 ? 'dead' : 'resolvingRoom',
            resolveCountdown: 2,
            resultsCountdown: health <= 0 ? 2 : state.resultsCountdown,
            player: { ...state.player, health, score: state.player.score + (cleared ? 5 : 0), streak: cleared ? state.player.streak + 1 : 0, roundsSurvived: cleared ? state.player.roundsSurvived + 1 : state.player.roundsSurvived },
            lastTurnResult: { roomCleared: cleared, damageTaken: damage, healingReceived: 0, scoreGained: cleared ? 5 : 0, message: cleared ? 'Sala superada' : 'Has recibido daño' },
        };
    }

    private tickDungeonState(currentState: GameStatePayload): GameStatePayload | null {
        const state = currentState.state as DungeonState;
        if (state.phase === 'bettingCountdown') {
            state.bettingCountdown -= 1;
            if (state.bettingCountdown <= 0) { state.phase = 'choosingClass'; state.bettingCountdown = 0; }
        } else if (state.phase === 'choosingClass') {
            state.classSelectionCountdown -= 1;
            if (state.classSelectionCountdown <= 0) return this.persistDungeonState(currentState, { ...state, phase: 'choosingCard', player: { ...state.player, class: 'warrior' }, currentRoom: this.createDungeonRoom(), hand: this.createDungeonHand() });
        } else if (state.phase === 'resolvingRoom') {
            state.resolveCountdown -= 1;
            if (state.resolveCountdown <= 0) return this.persistDungeonState(currentState, { ...state, phase: 'choosingCard', currentRoom: this.createDungeonRoom(), hand: this.createDungeonHand(), cardSelectionCountdown: 3 });
        } else {
            return null;
        }
        return this.persistDungeonState(currentState, state);
    }

    private persistDungeonState(currentState: GameStatePayload, state: DungeonState): GameStatePayload {
        const nextState = { ...currentState, state, timestamp: Date.now() };
        void this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
        return nextState;
    }

    private createDungeonRoom(): DungeonRoom {
        const type = Math.random() < 0.5 ? 'combat' : Math.random() < 0.8 ? 'trap' : 'empty';
        return { type, name: type === 'combat' ? 'Combate' : type === 'trap' ? 'Trampa' : 'Sala vacía', probability: 1, icon: type === 'combat' ? '⚔️' : type === 'trap' ? '🪤' : '🚪' };
    }

    private createDungeonHand(): DungeonCard[] {
        return [
            { id: 'clear-all', name: 'Carta segura', probability: 1, effects: ['clearAll'], icon: '✨' },
            { id: 'risk', name: 'Carta de riesgo', probability: 1, effects: [], icon: '⚠️' },
            { id: 'clear-combat', name: 'Golpe fuerte', probability: 1, effects: ['clearCombat'], icon: '⚔️' },
        ];
    }

    private isAllowedAction(payload: GameActionPayload): boolean {
        if (payload.game === 'the_race') {
            return payload.type === 'race_step' && !payload.action;
        }

        if (payload.game === 'fight_fight') {
            return payload.type === 'fight_select' &&
                ['punch', 'kick', 'grab', 'dodge'].includes(payload.action ?? '');
        }

        return payload.game === 'deep_&_dark' &&
            payload.type === 'dungeon_key' &&
            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(payload.action ?? '');
    }

    async getActiveGame(): Promise<MatchFoundPayload | null> {
        const rawMatch = await this.redis.get(ACTIVE_MATCH_KEY);
        if (!rawMatch) return null;
        const match = JSON.parse(rawMatch) as MatchFoundPayload;
        const participantIds = [...new Set([
            ...match.players.map((player) => player.userId),
            ...match.spectators,
        ])];
        const presence = participantIds.length > 0
            ? await this.redis.mget(...participantIds.map((userId) => `${PRESENCE_PREFIX}${userId}`))
            : [];
        const activeUsers = presence.filter(Boolean).length;
        if (participantIds.length < 2 || activeUsers < 2) {
            await this.redis.del(ACTIVE_MATCH_KEY, GAME_STATE_KEY);
            this.broadcastMatchmakingLog('Partida activa descartada: no hay dos usuarios activos', { participantIds, activeUsers });
            return null;
        }
        return match;
    }

    private async tryCreateMatch(): Promise<MatchmakingResult | null> {
        const lockToken = `${Date.now()}-${Math.random()}`;
        const lockAcquired = await this.redis.set(MATCHMAKING_LOCK_KEY, lockToken, 'EX', 15, 'NX');
        if (!lockAcquired) return null;

        try {
            const existingMatch = await this.getActiveGame();
            if (existingMatch) return { payload: existingMatch, created: false };

            const queueUsers = await this.cleanMatchmakingQueue();
            if (queueUsers.length < 2) {
                this.broadcastMatchmakingLog('Esperando al menos dos usuarios activos', { users: queueUsers });
                return null;
            }

            this.broadcastMatchmakingLog('Cuenta atras de matchmaking iniciada', { seconds: 5, users: queueUsers });
            for (let seconds = 5; seconds > 0; seconds -= 1) {
                this.broadcastMatchmakingLog(`Matchmaking comienza en ${seconds}`, { users: await this.getActiveMatchmakingUsers() });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if ((await this.cleanMatchmakingQueue()).length < 2) {
                    this.broadcastMatchmakingLog('Cuenta atras cancelada: un usuario se desconecto');
                    return null;
                }
            }

            const rawPlayers = await this.redis.lpop(MATCHMAKING_QUEUE_KEY, 2);
            if (!rawPlayers || rawPlayers.length < 2) return null;

            const userIds = rawPlayers.map((rawPlayer) => JSON.parse(rawPlayer).userId as string);
            userIds.sort(() => Math.random() - 0.5);

            const game = this.getRandomGame();
            const players = game === 'deep_&_dark'
                ? [{ userId: userIds[0], role: 'solo' as const }]
                : [
                    { userId: userIds[0], role: 'player1' as const },
                    { userId: userIds[1], role: 'player2' as const },
                ];
            const spectators = game === 'deep_&_dark' ? [userIds[1]] : [];
            const payload: MatchFoundPayload = {
                roomId: GAME_ROOM_ID,
                game,
                players,
                spectators,
            };

            const playerOneId = players[0]?.userId ?? 'N/A';
            const playerTwoId = players[1]?.userId ?? 'N/A';
            const logMessage = game === 'deep_&_dark'
                ? `Partida iniciada: Jugador 1: ${playerOneId}${spectators.length ? ` | Espectador: ${spectators.join(', ')}` : ''}`
                : `Partida iniciada: Jugador 1: ${playerOneId} | Jugador 2: ${playerTwoId}${spectators.length ? ` | Espectadores: ${spectators.join(', ')}` : ''}`;

            await this.redis.set(ACTIVE_MATCH_KEY, JSON.stringify(payload));
            for (const userId of userIds) {
                await this.addUserToRoom(userId, GAME_ROOM_ID);
            }
            logger.info(`Global match created: ${game} (${userIds.join(', ')})`);
            this.broadcastMatchmakingLog(logMessage, { game, roomId: GAME_ROOM_ID, players, spectators, player1: playerOneId, player2: playerTwoId });
            return { payload, created: true };
        } finally {
            const currentToken = await this.redis.get(MATCHMAKING_LOCK_KEY);
            if (currentToken === lockToken) {
                await this.redis.del(MATCHMAKING_LOCK_KEY);
            }
        }
    }

    private getRandomGame(): GameName {
        const games: GameName[] = ['the_race', 'fight_fight', 'deep_&_dark'];
        return games[Math.floor(Math.random() * games.length)];
    }

    private async cleanMatchmakingQueue(): Promise<string[]> {
        const entries = await this.redis.lrange(MATCHMAKING_QUEUE_KEY, 0, -1);
        const activeUsers: string[] = [];
        for (const entry of entries) {
            const parsed = JSON.parse(entry) as { userId: string };
            if ((await this.redis.exists(`${PRESENCE_PREFIX}${parsed.userId}`)) === 1) {
                activeUsers.push(parsed.userId);
            } else {
                await this.redis.lrem(MATCHMAKING_QUEUE_KEY, 1, entry);
                await this.redis.srem(MATCHMAKING_MEMBERS_KEY, parsed.userId);
            }
        }
        return [...new Set(activeUsers)];
    }

    private async getActiveMatchmakingUsers(): Promise<string[]> {
        const users = await this.redis.smembers(MATCHMAKING_MEMBERS_KEY);
        const activeUsers: string[] = [];
        for (const userId of users) {
            if ((await this.redis.exists(`${PRESENCE_PREFIX}${userId}`)) === 1) activeUsers.push(userId);
        }
        return activeUsers;
    }

    /**
     * Matchmaking lifecycle: a player left the active match or disconnected.
     * If the session no longer keeps at least two active participants, the match
     * is invalidated and the server clears the game state.
     */
    async handlePlayerDeparture(userId: string): Promise<void> {
        try {
            const activeMatch = await this.getActiveGame();
            if (!activeMatch) {
                await this.leaveMatchmaking(userId);
                return;
            }

            const participantIds = new Set([
                ...activeMatch.players.map((player) => player.userId),
                ...(activeMatch.spectators ?? []),
            ]);

            if (!participantIds.has(userId)) {
                await this.leaveMatchmaking(userId);
                return;
            }

            const remainingIds = [...participantIds].filter((id) => id !== userId);
            if (remainingIds.length < 2) {
                await this.redis.del(ACTIVE_MATCH_KEY, GAME_STATE_KEY);
                await this.leaveMatchmaking(userId);
                this.broadcastMatchmakingLog('Partida cancelada por desconexión', {
                    userId,
                    remainingIds,
                });
                return;
            }

            const remainingPresence = await this.redis.mget(
                ...remainingIds.map((id) => `${PRESENCE_PREFIX}${id}`),
            );
            const activeRemaining = remainingPresence.filter(Boolean).length;
            if (activeRemaining < 2) {
                await this.redis.del(ACTIVE_MATCH_KEY, GAME_STATE_KEY);
                await this.leaveMatchmaking(userId);
                this.broadcastMatchmakingLog('Partida cancelada por desconexión', {
                    userId,
                    remainingIds,
                    activeRemaining,
                });
                return;
            }

            await this.leaveMatchmaking(userId);
            logger.debug(`User ${userId} left an active match while the session remains valid`);
        } catch (error) {
            logger.error(`Error handling player departure for user ${userId}:`, error);
        }
    }

    /**
     * Matchmaking: Remove user from queue
     */
    async leaveMatchmaking(userId: string): Promise<void> {
        try {
            const queueItems = await this.redis.lrange(MATCHMAKING_QUEUE_KEY, 0, -1);
            for (const item of queueItems) {
                const parsed = JSON.parse(item);
                if (parsed.userId === userId) {
                    await this.redis.lrem(MATCHMAKING_QUEUE_KEY, 1, item);
                }
            }
            await this.redis.srem(MATCHMAKING_MEMBERS_KEY, userId);
            logger.debug(`User ${userId} removed from matchmaking queue`);
        } catch (error) {
            logger.error(`Error leaving matchmaking queue for user ${userId}:`, error);
        }
    }
}