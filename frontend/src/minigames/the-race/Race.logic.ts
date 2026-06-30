import {
  RACE_BETTING_COUNTDOWN_SECONDS,
  RACE_GAME_COUNTDOWN_SECONDS,
  RACE_PLAYER_1_ID,
  RACE_PLAYER_1_KEY,
  RACE_PLAYER_1_NAME,
  RACE_PLAYER_2_ID,
  RACE_PLAYER_2_KEY,
  RACE_PLAYER_2_NAME,
  RACE_RESULTS_COUNTDOWN_SECONDS,
  RACE_TARGET_SCORE,
  type RacePlayerId,
  type RaceState,
} from './Race.types';

export function createInitialRaceState(): RaceState {
  return {
    phase: 'bettingCountdown',
    bettingCountdown: RACE_BETTING_COUNTDOWN_SECONDS,
    gameCountdown: RACE_GAME_COUNTDOWN_SECONDS,
    resultsCountdown: RACE_RESULTS_COUNTDOWN_SECONDS,
    players: [
      {
        id: RACE_PLAYER_1_ID,
        name: RACE_PLAYER_1_NAME,
        progress: 0,
      },
      {
        id: RACE_PLAYER_2_ID,
        name: RACE_PLAYER_2_NAME,
        progress: 0,
      },
    ],
    winnerId: undefined,
  };
}

export function getPlayerIdFromKey(code: string): RacePlayerId | null {
  if (code === RACE_PLAYER_1_KEY) {
    return RACE_PLAYER_1_ID;
  }

  if (code === RACE_PLAYER_2_KEY) {
    return RACE_PLAYER_2_ID;
  }

  return null;
}

export function advancePlayer(
  state: RaceState,
  playerId: RacePlayerId,
): RaceState {
  if (state.phase !== 'running') {
    return state;
  }

  const updatedPlayers = state.players.map((player) => {
    if (player.id !== playerId) {
      return player;
    }

    return {
      ...player,
      progress: Math.min(player.progress + 1, RACE_TARGET_SCORE),
    };
  }) as RaceState['players'];

  const winner = updatedPlayers.find(
    (player) => player.progress >= RACE_TARGET_SCORE,
  );

  if (!winner) {
    return {
      ...state,
      players: updatedPlayers,
    };
  }

  return {
    ...state,
    phase: 'finished',
    players: updatedPlayers,
    winnerId: winner.id,
    resultsCountdown: RACE_RESULTS_COUNTDOWN_SECONDS,
  };
}

export function getRaceWinnerName(state: RaceState): string {
  const winner = state.players.find((player) => player.id === state.winnerId);

  return winner?.name ?? 'Unknown player';
}

export function getProgressPercentage(progress: number): number {
  return Math.min((progress / RACE_TARGET_SCORE) * 100, 100);
}

export function calculateRaceFinalScore(
  state: RaceState,
  durationSeconds: number,
): number {
  if (state.phase !== 'finished') {
    return 0;
  }

  if (!state.winnerId) {
    return 0;
  }

  const winner = state.players.find((player) => player.id === state.winnerId);

  const loser = state.players.find((player) => player.id !== state.winnerId);

  if (!winner || !loser) {
    return 0;
  }

  const pointsDifference = Math.max(0, winner.progress - loser.progress);
  const baseScore = pointsDifference * 3;
  const timeMultiplier = Math.max(0, 100 - durationSeconds);

  return baseScore * timeMultiplier;
}