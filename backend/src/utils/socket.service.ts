/**
 * Socket Service
 * Business logic for Socket.IO operations (presence, rooms, users, matchmaking)
 * Abstracts Redis operations and Socket.IO instance interactions
 */

import { Namespace, Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';
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
                username: user.username,
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
                username: user.username,
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
        const payload = { id: randomUUID(), message, details, timestamp: new Date().toISOString() };
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
                const isParticipant =
                    activeMatch.players.some((player) => player.userId === user.userId) ||
                    (activeMatch.spectators ?? []).includes(user.userId);

                await this.redis.sadd(MATCHMAKING_MEMBERS_KEY, user.userId);
                await this.addUserToRoom(user.userId, GAME_ROOM_ID);
                // Quien llega con una partida en curso y no participa en ella se pone en cola;
                // antes solo se añadía a "members" y nunca volvía a entrar en el matchmaking.
                if (!isParticipant) {
                    await this.enqueueForMatchmaking(user.userId, socketId);
                }
                const users = await this.getActiveMatchmakingUsers();
                this.broadcastMatchmakingLog('Usuario entra como espectador de la partida activa', { userId: user.userId, users });
                await this.logQueueState('joinMatchmaking:partida-activa', { userId: user.userId, isParticipant });
                return { payload: activeMatch, created: false };
            }

            // enqueueForMatchmaking es idempotente: si el usuario ya estaba en "members" pero
            // no en la cola (estado huérfano) lo vuelve a encolar.
            await this.enqueueForMatchmaking(user.userId, socketId);

            const users = await this.getActiveMatchmakingUsers();
            this.broadcastMatchmakingLog('Usuario entra en la sala global', { userId: user.userId, users });
            await this.logQueueState('joinMatchmaking:encolado', { userId: user.userId });
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
        if (!activeMatch) 
			return null;

        const currentState = await this.getGameState();
        if (currentState?.game === activeMatch.game) 
			return currentState;

        logger.info(`[matchmaking] ensureGameState: creando estado de juego para ${activeMatch.game} (players: ${activeMatch.players.map((p) => p.userId).join(', ')})`);

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

        if (activeMatch.game !== 'the_race') 
			return null;

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
        if (!action) 
			return null;

            if (payload.game === 'fight_fight') {
                const currentState = await this.ensureGameState();
                if (!currentState) 
					return null;
                const fightState = currentState.state as FightState;
                if (fightState.phase !== 'selecting') 
					return null;
                const player = action.role === 'player1' ? fightState.player1 : fightState.player2;
                if (payload.action === 'dodge' && player.previousAction === 'dodge') 
					return null;
                player.selectedAction = payload.action as FightAction;
                const nextState = { ...currentState, state: fightState, timestamp: Date.now() };
                await this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
                return { action, state: nextState };
            }

            if (payload.game === 'deep_&_dark') {
                const currentState = await this.ensureGameState();
                if (!currentState) 
					return null;
                const dungeonState = currentState.state as DungeonState;
                const nextState = this.applyDungeonAction(dungeonState, payload.action as string);
                if (!nextState) 
					return null;
                const state = { ...currentState, state: nextState, timestamp: Date.now() };
                await this.redis.set(GAME_STATE_KEY, JSON.stringify(state));
                return { action, state };
            }

            if (payload.game !== 'the_race') 
				return { action };

        const lockToken = `${Date.now()}-${Math.random()}`;
        const lockAcquired = await this.redis.set(GAME_STATE_LOCK_KEY, lockToken, 'EX', 5, 'NX');
        if (!lockAcquired) 
			return null;

        try {
            const currentState = await this.ensureGameState();
            if (!currentState) 
				return null;
            const raceState = currentState.state as {
                phase: string;
                players: { id: 'player1' | 'player2'; name: string; progress: number }[];
                winnerId?: 'player1' | 'player2';
                bettingCountdown: number;
                gameCountdown: number;
                resultsCountdown: number;
            };
            if (raceState.phase !== 'running') 
				return null;

            const playerId = action.role === 'player1' ? 'player1' : 'player2';
            const player = raceState.players.find((candidate) => candidate.id === playerId);
            if (!player) 
				return null;
            player.progress = Math.min(player.progress + 1, 100);
            if (player.progress >= 100) {
                raceState.phase = 'finished';
                raceState.winnerId = playerId;
                raceState.resultsCountdown = 3;
            }
            const nextState = { ...currentState, state: raceState, timestamp: Date.now() };
            await this.redis.set(GAME_STATE_KEY, JSON.stringify(nextState));
                if (raceState.phase === 'finished') {
                    void this.recycleFinishedMatch(nextState);
                }
            return { action, state: nextState };
        } finally {
            const currentToken = await this.redis.get(GAME_STATE_LOCK_KEY);
            if (currentToken === lockToken) await this.redis.del(GAME_STATE_LOCK_KEY);
        }
    }

    async tickGameState(): Promise<GameStatePayload | null> {
        const currentState = await this.getGameState();
        if (!currentState) 
			return null;

        if (this.isTerminalGameState(currentState)) {
            void this.recycleFinishedMatch(currentState);
            return null;
        }
        if (currentState.game === 'fight_fight') {
            const nextState = this.tickFightState(currentState);
            if (nextState && this.isTerminalGameState(nextState)) {
                void this.recycleFinishedMatch(nextState);
            }
            return nextState;
        }
        if (currentState.game === 'deep_&_dark') {
            const nextState = this.tickDungeonState(currentState);
            if (nextState && this.isTerminalGameState(nextState)) {
                void this.recycleFinishedMatch(nextState);
            }
            return nextState;
        }
        if (currentState.game !== 'the_race') 
			return null;
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
        if (raceState.phase === 'finished') {
            void this.recycleFinishedMatch(nextState);
        }
        return nextState;
    }

    private createFightState(): FightState {
        return {
            phase: 'bettingCountdown',
            round: 1,
            bettingCountdown: 3,
            selectionTimeLeft: 3,
            resolutionTimeLeft: 1,
            resultsCountdown: 300,
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
// No creo que haya forma de sacar los mensajes de player1 wins y player2 wins con os users siin liarla y no se me ocurre un substituto chulo
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
            message: resultType === 'draw' 
                ? (player1Action === 'grab' ? 'fight.grabMsg' : 'fight.drawMsg')
                : resultType === 'noDamage'
                    ? 'fight.dodgeMsg'
                    : resultType === 'player1Wins' ? 'fight.player1WinsMsg' : 'fight.player2WinsMsg',
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
            if (!dungeonClass) 
				return null;
            return { ...state, phase: 'choosingCard', player: { ...state.player, class: dungeonClass }, currentRoom: this.createDungeonRoom(), hand: this.createDungeonHand() };
        }
        if (state.phase !== 'choosingCard') 
			return null;
        if (key === 'ArrowDown') 
			return { ...state, phase: 'escaped', resultsCountdown: 2 };
        const cardIndex = key === 'ArrowLeft' ? 0 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? 2 : -1;
        if (cardIndex < 0) 
			return null;
        const card = state.hand[cardIndex] ?? state.hand[0];
        const room = state.currentRoom;
        if (!card || !room) 
			return null;
        const cleared = room.type === 'empty' || card.effects.includes('clearAll') || card.effects.includes(`clear${room.type === 'combat' ? 'Combat' : 'Trap'}`);
        const damage = cleared ? 0 : 1;
        const health = Math.max(state.player.health - damage, 0);
        return {
            ...state,
            phase: health <= 0 ? 'dead' : 'resolvingRoom',
            resolveCountdown: 2,
            resultsCountdown: health <= 0 ? 2 : state.resultsCountdown,
            player: { ...state.player, health, score: state.player.score + (cleared ? 5 : 0), streak: cleared ? state.player.streak + 1 : 0, roundsSurvived: cleared ? state.player.roundsSurvived + 1 : state.player.roundsSurvived },
            lastTurnResult: { roomCleared: cleared, damageTaken: damage, healingReceived: 0, scoreGained: cleared ? 5 : 0, message: cleared ? 'a' : 'ddd.fail' },
        };
    }

    private tickDungeonState(currentState: GameStatePayload): GameStatePayload | null {
        const state = currentState.state as DungeonState;
        if (state.phase === 'bettingCountdown') {
            state.bettingCountdown -= 1;
            if (state.bettingCountdown <= 0) { state.phase = 'choosingClass'; state.bettingCountdown = 0; }
        } else if (state.phase === 'choosingClass') {
            state.classSelectionCountdown -= 1;
            if (state.classSelectionCountdown <= 0) 
				return this.persistDungeonState(currentState, { ...state, phase: 'choosingCard', player: { ...state.player, class: 'warrior' }, currentRoom: this.createDungeonRoom(), hand: this.createDungeonHand() });
        } else if (state.phase === 'resolvingRoom') {
            state.resolveCountdown -= 1;
            if (state.resolveCountdown <= 0) 
				return this.persistDungeonState(currentState, { ...state, phase: 'choosingCard', currentRoom: this.createDungeonRoom(), hand: this.createDungeonHand(), cardSelectionCountdown: 3 });
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

    private isTerminalGameState(state: GameStatePayload): boolean {
        if (state.game === 'the_race') {
            return (state.state as { phase?: string }).phase === 'finished';
        }

        if (state.game === 'fight_fight') {
            return (state.state as { phase?: string }).phase === 'finished';
        }

        if (state.game === 'deep_&_dark') {
            const phase = (state.state as { phase?: string }).phase;
            return phase === 'escaped' || phase === 'dead' || phase === 'finished';
        }

        return false;
    }

    /**
     * Fin de partida: limpia el estado y devuelve a todos al FINAL de la cola.
     * Orden resultante: [los que ya esperaban] + [los que acaban de jugar].
     * `excludeIds` = usuarios que se han ido voluntariamente y no deben reencolarse.
     */
    private async recycleFinishedMatch(state: GameStatePayload, excludeIds: string[] = []): Promise<void> {
        const activeMatch = await this.getRawActiveMatch();
        if (!activeMatch || activeMatch.game !== state.game)
            return;

        // Borrado atómico: si dos ticks/acciones llegan a la vez, solo uno continúa.
        const deleted = await this.redis.del(ACTIVE_MATCH_KEY);
        if (deleted === 0)
            return;
        await this.redis.del(GAME_STATE_KEY);

        const participantIds = [...new Set([
            ...activeMatch.players.map((player) => player.userId),
            ...(activeMatch.spectators ?? []),
        ])];
        await this.logQueueState('recycleFinishedMatch:inicio', { game: state.game, participantIds, excludeIds });

        const presence = participantIds.length > 0
            ? await this.redis.mget(...participantIds.map((userId) => `${PRESENCE_PREFIX}${userId}`))
            : [];

        const requeueIds: string[] = [];
        const goneIds: string[] = [];
        participantIds.forEach((userId, index) => {
            if (presence[index] && !excludeIds.includes(userId)) requeueIds.push(userId);
            else goneIds.push(userId);
        });

        for (const userId of goneIds) {
            await this.leaveMatchmaking(userId);
        }

        // Red de seguridad: usuarios conectados en "members" que no están en la cola ni jugaron
        // (p. ej. entraron durante la partida). Van ANTES que los que acaban de jugar.
        const participantSet = new Set(participantIds);
        const members = [...new Set([
            ...(await this.redis.smembers(MATCHMAKING_MEMBERS_KEY)),
            ...(await this.redis.smembers(`${ROOM_USERS_PREFIX}${GAME_ROOM_ID}`)),
        ])];
        for (const memberId of members) {
            if (participantSet.has(memberId)) continue;
            if ((await this.redis.exists(`${PRESENCE_PREFIX}${memberId}`)) === 1) {
                await this.enqueueForMatchmaking(memberId);
            }
        }

        // Los que han jugado, al final de la cola.
        for (const userId of requeueIds) {
            await this.addUserToRoom(userId, GAME_ROOM_ID);
            await this.enqueueForMatchmaking(userId);
        }

        this.broadcastMatchmakingLog('Partida finalizada, reencolando usuarios', {
            game: state.game,
            users: requeueIds,
            gone: goneIds,
            playerCount: activeMatch.players.length,
            spectatorCount: (activeMatch.spectators ?? []).length,
        });
        await this.logQueueState('recycleFinishedMatch:fin', { requeueIds, goneIds });

        void this.tryCreateMatch(true);
    }

    /**
     * Mete al usuario al final de la cola si no estaba ya. Devuelve true si lo ha añadido.
     */
    private async enqueueForMatchmaking(userId: string, socketId = 'requeue'): Promise<boolean> {
        await this.redis.sadd(MATCHMAKING_MEMBERS_KEY, userId);

        const queued = await this.getQueueUserIds();
        if (queued.includes(userId))
            return false;

        await this.redis.rpush(
            MATCHMAKING_QUEUE_KEY,
            JSON.stringify({ userId, socketId, timestamp: Date.now() }),
        );
        return true;
    }

    private async requeueUsers(userIds: string[]): Promise<void> {
        for (const userId of userIds) {
            await this.addUserToRoom(userId, GAME_ROOM_ID);
            await this.enqueueForMatchmaking(userId);
        }
    }

    private createDungeonRoom(): DungeonRoom {
        const type = Math.random() < 0.5 ? 'combat' : Math.random() < 0.8 ? 'trap' : 'empty';
        return { type, name: type === 'combat' ? 'ddd.roomType.combat' : type === 'trap' ? 'ddd.roomType.trap' : 'ddd.roomType.empty', probability: 1, icon: type === 'combat' ? '⚔️' : type === 'trap' ? '🪤' : '🚪' };
    }

    private createDungeonHand(dungeonClass: 'mague' | 'rogue' | 'warrior' = 'warrior'): DungeonCard[] {
        const deck = DUNGEON_DECKS[dungeonClass];
        const total = deck.reduce((sum, card) => sum + card.probability, 0);

        return Array.from({ length: DUNGEON_HAND_SIZE }, () => {
            let roll = Math.random() * total;
            const picked = deck.find((card) => (roll -= card.probability) < 0) ?? deck[0];
            return { ...picked, effects: [...picked.effects] };
        });
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
        
		if (!rawMatch) 
			return null;
        
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
            // await this.redis.del(ACTIVE_MATCH_KEY, GAME_STATE_KEY);
            this.broadcastMatchmakingLog('Partida activa descartada: no hay dos usuarios activos', { participantIds, activeUsers });
            return null;
        }
        return match;
    }

    /**
     * Lee ACTIVE_MATCH_KEY tal cual, sin filtrar por presencia.
     * getActiveGame() devuelve null si hay <2 conectados pero NO borra la clave, y
     * quienes limpian el estado (reciclado / desconexión) necesitan ver la partida real.
     */
    private async getRawActiveMatch(): Promise<MatchFoundPayload | null> {
        const rawMatch = await this.redis.get(ACTIVE_MATCH_KEY);
        if (!rawMatch)
            return null;
        try {
            return JSON.parse(rawMatch) as MatchFoundPayload;
        } catch {
            return null;
        }
    }

    private async getQueueUserIds(): Promise<string[]> {
        const entries = await this.redis.lrange(MATCHMAKING_QUEUE_KEY, 0, -1);
        const ids: string[] = [];
        for (const entry of entries) {
            try {
                const parsed = JSON.parse(entry) as { userId?: string };
                if (parsed.userId) ids.push(parsed.userId);
            } catch {
                // entrada corrupta: la ignoramos aquí, cleanMatchmakingQueue la elimina
            }
        }
        return ids;
    }

    /**
     * Log de diagnóstico: foto de la cola en orden, del set de members y de la partida activa.
     * `membersOutsideQueue` es lo que más interesa: usuarios en members que no están en la cola
     * (jugando ahora o "huérfanos", que son los que se quedan sin volver a entrar).
     */
    private async logQueueState(label: string, extra: Record<string, unknown> = {}): Promise<void> {
        try {
            const [queue, members, rawMatch, rawState] = await Promise.all([
                this.getQueueUserIds(),
                this.redis.smembers(MATCHMAKING_MEMBERS_KEY),
                this.redis.get(ACTIVE_MATCH_KEY),
                this.redis.get(GAME_STATE_KEY),
            ]);
            const match = rawMatch ? JSON.parse(rawMatch) as MatchFoundPayload : null;
            const gameState = rawState ? JSON.parse(rawState) as GameStatePayload : null;
            const queueSet = new Set(queue);

            logger.info(`[matchmaking][cola] ${label} ` + JSON.stringify({
                queue,
                queueSize: queue.length,
                duplicatesInQueue: queue.length - queueSet.size,
                members,
                membersOutsideQueue: members.filter((id) => !queueSet.has(id)),
                activeMatch: match
                    ? { game: match.game, players: match.players.map((p) => p.userId), spectators: match.spectators ?? [] }
                    : null,
                gameState: gameState
                    ? { game: gameState.game, phase: (gameState.state as { phase?: string }).phase, terminal: this.isTerminalGameState(gameState) }
                    : null,
                ...extra,
            }));
        } catch (error) {
            logger.error(`[matchmaking][cola] error generando log "${label}":`, error);
        }
    }

    /**
     * @param notify true cuando la partida se crea en segundo plano (reciclado, cancelación,
     * reintento): nadie espera el resultado, así que hay que avisar a la sala con `match_found`.
     * Desde joinMatchmaking va en false porque el gateway ya emite el evento con el resultado.
     */
private async tryCreateMatch(notify = false): Promise<MatchmakingResult | null> {
    const lockToken = `${Date.now()}-${Math.random()}`;

    const lockAcquired = await this.redis.set(
        MATCHMAKING_LOCK_KEY,
        lockToken,
        'EX',
        15,
        'NX',
    );

    if (!lockAcquired) {
        logger.debug('[matchmaking] tryCreateMatch omitido: ya hay otro intento en curso (lock); se reintentará',
        );
        setTimeout(() => {
            void this.tryCreateMatch(true);
        }, 500);
        return null;
    }

    try {
        const existingMatch = await this.getActiveGame();

        if (existingMatch) {
            return {
                payload: existingMatch,
                created: false,
            };
        }

        let queueUsers = await this.cleanMatchmakingQueue();

        await this.logQueueState('tryCreateMatch:inicio', {
            queueUsers,
        });

        if (queueUsers.length < 2) {
            this.broadcastMatchmakingLog(
                'Esperando al menos dos usuarios activos',
                { users: queueUsers },
            );

            return null;
        }

        this.broadcastMatchmakingLog(
            'Cuenta atras de matchmaking iniciada',
            {
                seconds: 5,
                users: queueUsers,
            },
        );

        for (let seconds = 5; seconds > 0; seconds -= 1) {
            this.broadcastMatchmakingLog(
                `Matchmaking comienza en ${seconds}`,
                {
                    users: await this.getActiveMatchmakingUsers(),
                },
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));

            queueUsers = await this.cleanMatchmakingQueue();

            if (queueUsers.length < 2) {
                this.broadcastMatchmakingLog('Cuenta atras cancelada: un usuario se desconecto',{users: queueUsers,},);
                await this.logQueueState('tryCreateMatch:cuenta-atras-cancelada',{seconds,queueUsers,},);
                return null;
            }
        }

        const rawPlayers =
            (await this.redis.lpop(MATCHMAKING_QUEUE_KEY, 2)) ?? [];
        const popped = rawPlayers.map((raw) => ({raw,userId: (JSON.parse(raw) as { userId: string }).userId,}));

        await this.logQueueState('tryCreateMatch:tras-lpop', {popped: popped.map((p) => p.userId),});

        // Validar que los dos sigan conectados y sean distintos.
        const valid: typeof popped = [];

        for (const entry of popped) {
            const connected =
                (await this.redis.exists(`${PRESENCE_PREFIX}${entry.userId}`,)) === 1;

            if (connected && !valid.some((v) => v.userId === entry.userId)) {
                valid.push(entry);
            } else if (!connected) {
                await this.redis.srem(MATCHMAKING_MEMBERS_KEY, entry.userId,);
            }
        }

        if (valid.length < 2) {
            // Devolver a los válidos a la cabeza de la cola.
            for (const entry of [...valid].reverse()) {
                await this.redis.lpush(MATCHMAKING_QUEUE_KEY, entry.raw,);
            }

            this.broadcastMatchmakingLog(
                'Matchmaking abortado: un jugador se desconectó justo antes de empezar',
                {
                    popped: popped.map((p) => p.userId),
                    returnedToQueue: valid.map((v) => v.userId),
                },
            );

            await this.logQueueState('tryCreateMatch:abortado-tras-lpop',);
            setTimeout(() => {
                void this.tryCreateMatch(true);}, 500);
            return null;
        }

        const userIds = valid.map((entry) => entry.userId);
        userIds.sort(() => Math.random() - 0.5);
        const game = this.getRandomGame();
        const participantDetails = await this.redis.mget(
            ...userIds.map(
                (userId) => `${PRESENCE_PREFIX}${userId}`,
            ),
        );

        const usernamesByUserId = new Map(
            userIds.map((userId, index) => {
                const rawPresence = participantDetails[index];
                const username = rawPresence
                    ? (JSON.parse(rawPresence) as UserPresence).username
                    : userId;

                return [userId, username] as const;
            }),
        );

        const players =
            game === 'deep_&_dark'
                ? [{ userId: userIds[0], username: usernamesByUserId.get(userIds[0]) ?? userIds[0], role: 'solo' as const,},]
                : [{userId: userIds[0], username: usernamesByUserId.get(userIds[0]) ?? userIds[0], role: 'player1' as const, },
                    {userId: userIds[1], username: usernamesByUserId.get(userIds[1]) ?? userIds[1],role: 'player2' as const,},
                ];

        const spectators =
            game === 'deep_&_dark'
                ? [userIds[1]]
                : [];

        const payload: MatchFoundPayload = {
            roomId: GAME_ROOM_ID,
            game,
            players,
            spectators,
        };

        const playerOneId = players[0]?.userId ?? 'N/A';
        const playerTwoId = players[1]?.userId ?? 'N/A';

        const logMessage =
            game === 'deep_&_dark'
                ? `Partida iniciada: Jugador 1: ${playerOneId}${
                    spectators.length
                        ? ` | Espectador: ${spectators.join(', ')}`
                        : ''
                }`
                : `Partida iniciada: Jugador 1: ${playerOneId} | Jugador 2: ${playerTwoId}${
                    spectators.length
                        ? ` | Espectadores: ${spectators.join(', ')}`
                        : ''
                }`;

        // Limpiar el estado de la partida anterior antes de crear una nueva.
        await this.redis.del(GAME_STATE_KEY);

        await this.redis.set(ACTIVE_MATCH_KEY,JSON.stringify(payload),);

        for (const userId of userIds) {
			await this.addUserToRoom(userId,GAME_ROOM_ID,);
        }

        logger.info(
            `Global match created: ${game} (${userIds.join(', ')})`,
        );

        this.broadcastMatchmakingLog(
            logMessage,
            {
                game,
                roomId: GAME_ROOM_ID,
                players,
                spectators,
                player1: playerOneId,
                player2: playerTwoId,
            },
        );

        await this.logQueueState(
            'tryCreateMatch:partida-creada',
            {
                game,
                notify,
            },
        );

        if (notify) {
            this.broadcastToRoom(
                GAME_ROOM_ID,
                'match_found',
                payload,
            );
        }

        return {payload, created: true,};
    } finally {
        const currentToken =
            await this.redis.get(MATCHMAKING_LOCK_KEY);

        if (currentToken === lockToken) {
            await this.redis.del(MATCHMAKING_LOCK_KEY);
        }
    }
}

    private getRandomGame(): GameName {
        const games: GameName[] = ['the_race', 'fight_fight', 'deep_&_dark'];
        return games[Math.floor(Math.random() * games.length)];
    }

    /**
     * Elimina de la cola a desconectados, duplicados y entradas corruptas.
     * Devuelve los userIds válidos en orden de cola.
     */
    private async cleanMatchmakingQueue(): Promise<string[]> {
        const entries = await this.redis.lrange(MATCHMAKING_QUEUE_KEY, 0, -1);
        const seen = new Set<string>();
        const activeUsers: string[] = [];

        for (const entry of entries) {
            let userId: string | undefined;
            try {
                userId = (JSON.parse(entry) as { userId?: string }).userId;
            } catch {
                userId = undefined;
            }

            const connected = userId ? (await this.redis.exists(`${PRESENCE_PREFIX}${userId}`)) === 1 : false;
            if (userId && connected && !seen.has(userId)) {
                seen.add(userId);
                activeUsers.push(userId);
                continue;
            }

            await this.redis.lrem(MATCHMAKING_QUEUE_KEY, 1, entry);
            if (userId && !connected) {
                await this.redis.srem(MATCHMAKING_MEMBERS_KEY, userId);
            }
        }

        logger.debug(`[matchmaking] cleanMatchmakingQueue ${JSON.stringify({ activeUsers, queueSize: activeUsers.length })}`);
        return activeUsers;
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
     * - Partida terminada: se recicla y todos los demás vuelven al final de la cola.
     * - Partida en curso que se queda sin 2 participantes conectados: se cancela
     *   (se borra ACTIVE_MATCH + GAME_STATE) y los que quedan se reencolan.
     */
    async handlePlayerDeparture(userId: string): Promise<void> {
        try {
            await this.logQueueState('handlePlayerDeparture:inicio', { userId });

            // Raw: getActiveGame() devuelve null en cuanto el usuario que se va pierde la presencia,
            // y entonces nadie limpiaba la partida ni reencolaba al que se quedaba.
            const activeMatch = await this.getRawActiveMatch();
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

            const currentState = await this.getGameState();
            const matchFinished = currentState !== null &&
                currentState.game === activeMatch.game &&
                this.isTerminalGameState(currentState);

            if (matchFinished && currentState) {
                await this.leaveMatchmaking(userId);
                await this.recycleFinishedMatch(currentState, [userId]);
                return;
            }

            const remainingIds = [...participantIds].filter((id) => id !== userId);
            const remainingPresence = remainingIds.length > 0
                ? await this.redis.mget(...remainingIds.map((id) => `${PRESENCE_PREFIX}${id}`))
                : [];
            const activeRemainingIds = remainingIds.filter((_, index) => Boolean(remainingPresence[index]));

            if (activeRemainingIds.length >= 2) {
                await this.leaveMatchmaking(userId);
                logger.debug(`User ${userId} left an active match while the session remains valid`);
                await this.logQueueState('handlePlayerDeparture:partida-continua', { userId, activeRemainingIds });
                return;
            }

            // La partida ya no puede continuar: limpiar estado y reencolar a los que quedan.
            await this.redis.del(ACTIVE_MATCH_KEY, GAME_STATE_KEY);
            await this.leaveMatchmaking(userId);
            for (const id of remainingIds) {
                if (!activeRemainingIds.includes(id)) await this.leaveMatchmaking(id);
            }
            await this.requeueUsers(activeRemainingIds);

            this.broadcastMatchmakingLog('Partida cancelada por desconexión', {
                userId,
                remainingIds,
                activeRemainingIds,
            });
            await this.logQueueState('handlePlayerDeparture:partida-cancelada', { userId, activeRemainingIds });
            void this.tryCreateMatch(true);
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
                try {
                    if ((JSON.parse(item) as { userId?: string }).userId === userId) {
                        await this.redis.lrem(MATCHMAKING_QUEUE_KEY, 1, item);
                    }
                } catch {
                    await this.redis.lrem(MATCHMAKING_QUEUE_KEY, 1, item);
                }
            }
            await this.redis.srem(MATCHMAKING_MEMBERS_KEY, userId);
            logger.debug(`User ${userId} removed from matchmaking queue`);
            await this.logQueueState('leaveMatchmaking', { userId });
        } catch (error) {
            logger.error(`Error leaving matchmaking queue for user ${userId}:`, error);
        }
    }
}