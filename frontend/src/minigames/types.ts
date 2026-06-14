export type MinigameId =
  | 'the-race'
  | 'fight-fight'
  | 'deep-dark-dungeon';

export type MinigameStatus =
  | 'idle'
  | 'waiting'
  | 'bettingCountdown'
  | 'countdown'
  | 'playing'
  | 'resolving'
  | 'finished'
  | 'cancelled';

export type MinigamePlayer = {
  id: string;
  name: string;
};

export type MinigameResult = {
  minigameId: MinigameId;
  winnerId?: string;
  loserId?: string;
  score: number;
  roundsPlayed?: number;
  durationMs?: number;
};