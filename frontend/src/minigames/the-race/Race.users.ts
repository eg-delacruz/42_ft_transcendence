import type { RacePlayerId } from './Race.types';

export type RaceGameUser = {
  playerId: RacePlayerId;
  userId: string;
  displayName: string;
};

export const RACE_DEV_USERS: Record<RacePlayerId, RaceGameUser> = {
  player1: {
    playerId: 'player1',
    userId: '6a38160d2bef44c6bd9df8a3',
    displayName: 'terto',
  },
  player2: {
    playerId: 'player2',
    userId: '6a38160d2bef44c6bd9df8a4',
    displayName: 'Gerardo',
  },
};

export function getRaceUserId(playerId: RacePlayerId): string {
  return RACE_DEV_USERS[playerId].userId;
}

export function getRaceDisplayName(playerId: RacePlayerId): string {
  return RACE_DEV_USERS[playerId].displayName;
}