export type RacePhase =
  | 'bettingCountdown'
  | 'gameCountdown'
  | 'running'
  | 'finished';

export type RacePlayerId = 'player1' | 'player2';

export type RacePlayer = {
  id: RacePlayerId;
  name: string;
  progress: number;
};

export type RaceState = {
  phase: RacePhase;
  players: [RacePlayer, RacePlayer];
  bettingCountdown: number;
  gameCountdown: number;
  resultsCountdown: number;
  winnerId?: RacePlayerId;
};

export const RACE_TARGET_SCORE = 50;
export const RACE_BETTING_COUNTDOWN_SECONDS = 3;
export const RACE_GAME_COUNTDOWN_SECONDS = 3;
export const RACE_RESULTS_COUNTDOWN_SECONDS = 3;

export const RACE_PLAYER_1_KEY = 'ArrowUp';
export const RACE_PLAYER_2_KEY = 'KeyA';