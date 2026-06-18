export type FightAction =
  | 'punch'
  | 'kick'
  | 'grab'
  | 'dodge';

export type FightPhase =
  | 'bettingCountdown'
  | 'selecting'
  | 'resolving'
  | 'finished';

export type FightPlayerId = 'player1' | 'player2';

export type FightPlayer = {
  id: FightPlayerId;
  name: string;
  health: number;
  score: number;
  selectedAction?: FightAction;
  previousAction?: FightAction;
  consecutiveWins: number;
};

export type FightRoundResultType =
  | 'player1Wins'
  | 'player2Wins'
  | 'draw'
  | 'noDamage';

export type FightRoundResult = {
  resultType: FightRoundResultType;
  player1Damage: number;
  player2Damage: number;
  player1ScoreGain: number;
  player2ScoreGain: number;
  message: string;
};

export type FightState = {
  phase: FightPhase;
  round: number;
  bettingCountdown: number;
  selectionTimeLeft: number;
  resolutionTimeLeft: number;
  resultsCountdown: number;
  player1: FightPlayer;
  player2: FightPlayer;
  lastRoundResult?: FightRoundResult;
  winnerId?: FightPlayerId;
};

export const FIGHT_INITIAL_HEALTH = 100;

export const FIGHT_BETTING_COUNTDOWN_SECONDS = 3;
export const FIGHT_SELECTION_SECONDS = 1;
export const FIGHT_RESOLUTION_SECONDS = 1;
export const FIGHT_RESULTS_COUNTDOWN_SECONDS = 3;

export const FIGHT_BASE_DAMAGE = 10;
export const FIGHT_DRAW_DAMAGE = 5;
export const FIGHT_CONSECUTIVE_WIN_BONUS_DAMAGE = 2;
export const FIGHT_LOW_HEALTH_RESISTANCE = 1;

export const FIGHT_WIN_SCORE = 2;
export const FIGHT_CONSECUTIVE_WIN_SCORE = 5;
export const FIGHT_DRAW_SCORE = 1;
export const FIGHT_ROUND_SCORE = 3;

export const FIGHT_ACTION_LABELS: Record<FightAction, string> = {
  punch: 'Puñetazo',
  kick: 'Patada',
  grab: 'Agarre',
  dodge: 'Esquiva',
};

export const FIGHT_ACTION_ICONS: Record<FightAction, string> = {
  punch: '👊',
  kick: '🦵',
  grab: '🤼',
  dodge: '💨',
};

export const FIGHT_PLAYER_1_CONTROLS: Record<string, FightAction> = {
  ArrowLeft: 'punch',
  ArrowRight: 'kick',
  ArrowUp: 'grab',
  ArrowDown: 'dodge',
};

export const FIGHT_PLAYER_2_CONTROLS: Record<string, FightAction> = {
  KeyA: 'punch',
  KeyD: 'kick',
  KeyW: 'grab',
  KeyS: 'dodge',
};

export const FIGHT_PLAYER_1_CONTROL_LABELS: Record<FightAction, string> = {
  punch: '←',
  kick: '→',
  grab: '↑',
  dodge: '↓',
};

export const FIGHT_PLAYER_2_CONTROL_LABELS: Record<FightAction, string> = {
  punch: 'A',
  kick: 'D',
  grab: 'W',
  dodge: 'S',
};

export const FIGHT_ACTION_DESCRIPTIONS: Record<FightAction, string> = {
  punch: 'Gana a agarre',
  kick: 'Gana a puñetazo',
  grab: 'Gana a patada',
  dodge: 'Evita daño',
};

export const FIGHT_PLAYER_1_CONTROLS_TEXT =
  '← 👊 | → 🦵 | ↑ 🤼 | ↓ 💨';

export const FIGHT_PLAYER_2_CONTROLS_TEXT =
  'A 👊 | D 🦵 | W 🤼 | S 💨';