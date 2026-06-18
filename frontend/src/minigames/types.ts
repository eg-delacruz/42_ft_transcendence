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

export type MinigameTopScoreUser = {
  _id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  points: number;
};

export type MinigameTopScore = {
  position: 1 | 2 | 3;
  user: MinigameTopScoreUser | null;
  score: number;
};

export type MinigameGameResponse = {
  _id?: string;
  name: string;
  top_1_user: MinigameTopScoreUser | null;
  top_1_score: number;
  top_2_user: MinigameTopScoreUser | null;
  top_2_score: number;
  top_3_user: MinigameTopScoreUser | null;
  top_3_score: number;
};

export const MINIGAME_API_NAMES: Record<MinigameId, string> = {
  'the-race': 'the_race',
  'fight-fight': 'fight_fight',
  'deep-dark-dungeon': 'deep_&_dark',
};