// Fight.users.ts
import type { FightPlayerId } from './Fight.types';

export type FightGameUser = {
  playerId: FightPlayerId;
  userId: string;
  displayName: string;
};

export const FIGHT_DEV_USERS: Record<FightPlayerId, FightGameUser> = {
  player1: {
    playerId: 'player1',
    userId: '6a38160d2bef44c6bd9df8a6',
    displayName: 'Pex',
  },
  player2: {
    playerId: 'player2',
    userId: '6a38160d2bef44c6bd9df8a5',
    displayName: 'Javi',
  },
};

export function getFightUserId(playerId: FightPlayerId): string {
  return FIGHT_DEV_USERS[playerId].userId;
}