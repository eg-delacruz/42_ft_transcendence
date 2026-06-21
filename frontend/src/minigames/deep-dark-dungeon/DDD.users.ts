// DDD.users.ts
export type DungeonGameUser = {
  userId: string;
  displayName: string;
};

export const DUNGEON_DEV_USER: DungeonGameUser = {
  userId: '6a38160d2bef44c6bd9df8a7',
  displayName: 'David',
};

export function getDungeonUserId(): string {
  return DUNGEON_DEV_USER.userId;
}