import {
  FIGHT_ACTION_ICONS,
  FIGHT_ACTION_LABELS,
  FIGHT_BASE_DAMAGE,
  FIGHT_BETTING_COUNTDOWN_SECONDS,
  FIGHT_CONSECUTIVE_WIN_BONUS_DAMAGE,
  FIGHT_CONSECUTIVE_WIN_SCORE,
  FIGHT_DRAW_DAMAGE,
  FIGHT_DRAW_SCORE,
  FIGHT_INITIAL_HEALTH,
  FIGHT_LOW_HEALTH_RESISTANCE,
  FIGHT_PLAYER_1_CONTROLS,
  FIGHT_PLAYER_2_CONTROLS,
  FIGHT_RESOLUTION_SECONDS,
  FIGHT_RESULTS_COUNTDOWN_SECONDS,
  FIGHT_ROUND_SCORE,
  FIGHT_SELECTION_SECONDS,
  FIGHT_WIN_SCORE,
  type FightAction,
  type FightPlayer,
  type FightPlayerId,
  type FightRoundResult,
  type FightState,
} from './Fight.types';

export function createInitialPlayer(
  id: FightPlayerId,
  name: string,
): FightPlayer {
  return {
    id,
    name,
    health: FIGHT_INITIAL_HEALTH,
    score: 0,
    selectedAction: undefined,
    previousAction: undefined,
    consecutiveWins: 0,
  };
}

export function createInitialFightState(): FightState {
  return {
    phase: 'bettingCountdown',
    round: 1,
    bettingCountdown: FIGHT_BETTING_COUNTDOWN_SECONDS,
    selectionTimeLeft: FIGHT_SELECTION_SECONDS,
    resolutionTimeLeft: FIGHT_RESOLUTION_SECONDS,
    resultsCountdown: FIGHT_RESULTS_COUNTDOWN_SECONDS,
    player1: createInitialPlayer('player1', 'Player 1'),
    player2: createInitialPlayer('player2', 'Player 2'),
    lastRoundResult: undefined,
    winnerId: undefined,
  };
}

export function getSelectionFromKey(
  code: string,
): { playerId: FightPlayerId; action: FightAction } | null {
  const player1Action = FIGHT_PLAYER_1_CONTROLS[code];

  if (player1Action) {
    return {
      playerId: 'player1',
      action: player1Action,
    };
  }

  const player2Action = FIGHT_PLAYER_2_CONTROLS[code];

  if (player2Action) {
    return {
      playerId: 'player2',
      action: player2Action,
    };
  }

  return null;
}

export function selectAction(
  state: FightState,
  playerId: FightPlayerId,
  action: FightAction,
): FightState {
  if (state.phase !== 'selecting') {
    return state;
  }

  if (playerId === 'player1') {
    if (action === 'dodge' && state.player1.previousAction === 'dodge') {
      return state;
    }

    return {
      ...state,
      player1: {
        ...state.player1,
        selectedAction: action,
      },
    };
  }

  if (action === 'dodge' && state.player2.previousAction === 'dodge') {
    return state;
  }

  return {
    ...state,
    player2: {
      ...state.player2,
      selectedAction: action,
    },
  };
}

export function resolveRound(state: FightState): FightState {
  const player1Action = state.player1.selectedAction ?? 'dodge';
  const player2Action = state.player2.selectedAction ?? 'dodge';

  const roundResult = calculateRoundResult(
    state.player1,
    state.player2,
    player1Action,
    player2Action,
  );

  const nextPlayer1Health = Math.max(
    state.player1.health - roundResult.player1Damage,
    0,
  );

  const nextPlayer2Health = Math.max(
    state.player2.health - roundResult.player2Damage,
    0,
  );

  return {
    ...state,
    phase: 'resolving',
    resolutionTimeLeft: FIGHT_RESOLUTION_SECONDS,
    player1: {
      ...state.player1,
      health: nextPlayer1Health,
      score: state.player1.score + roundResult.player1ScoreGain,
      previousAction: player1Action,
      selectedAction: player1Action,
      consecutiveWins:
        roundResult.resultType === 'player1Wins'
          ? state.player1.consecutiveWins + 1
          : 0,
    },
    player2: {
      ...state.player2,
      health: nextPlayer2Health,
      score: state.player2.score + roundResult.player2ScoreGain,
      previousAction: player2Action,
      selectedAction: player2Action,
      consecutiveWins:
        roundResult.resultType === 'player2Wins'
          ? state.player2.consecutiveWins + 1
          : 0,
    },
    lastRoundResult: roundResult,
  };
}

export function calculateRoundResult(
  player1: FightPlayer,
  player2: FightPlayer,
  player1Action: FightAction,
  player2Action: FightAction,
): FightRoundResult {
  if (player1Action === 'dodge' || player2Action === 'dodge') {
    return {
      resultType: 'noDamage',
      player1Damage: 0,
      player2Damage: 0,
      player1ScoreGain: FIGHT_ROUND_SCORE,
      player2ScoreGain: FIGHT_ROUND_SCORE,
      message: `${FIGHT_ACTION_ICONS.dodge} Esquiva usada. Nadie recibe daño.`,
    };
  }

  if (player1Action === player2Action) {
    if (player1Action === 'grab') {
      return {
        resultType: 'noDamage',
        player1Damage: 0,
        player2Damage: 0,
        player1ScoreGain: FIGHT_ROUND_SCORE + FIGHT_DRAW_SCORE,
        player2ScoreGain: FIGHT_ROUND_SCORE + FIGHT_DRAW_SCORE,
        message: `${FIGHT_ACTION_ICONS.grab} Ambos usan agarre. Nadie recibe daño.`,
      };
    }

    return {
      resultType: 'draw',
      player1Damage: applyResistance(player1, FIGHT_DRAW_DAMAGE),
      player2Damage: applyResistance(player2, FIGHT_DRAW_DAMAGE),
      player1ScoreGain: FIGHT_ROUND_SCORE + FIGHT_DRAW_SCORE,
      player2ScoreGain: FIGHT_ROUND_SCORE + FIGHT_DRAW_SCORE,
      message: `Empate de ${FIGHT_ACTION_ICONS[player1Action]} ${FIGHT_ACTION_LABELS[player1Action]}. Ambos reciben daño.`,
    };
  }

  if (doesFirstActionBeatSecond(player1Action, player2Action)) {
    const damage = getWinningDamage(player1);

    return {
      resultType: 'player1Wins',
      player1Damage: 0,
      player2Damage: applyResistance(player2, damage),
      player1ScoreGain:
        FIGHT_ROUND_SCORE +
        FIGHT_WIN_SCORE +
        (player1.consecutiveWins > 0 ? FIGHT_CONSECUTIVE_WIN_SCORE : 0),
      player2ScoreGain: FIGHT_ROUND_SCORE,
      message: `Player 1 gana: ${FIGHT_ACTION_ICONS[player1Action]} ${FIGHT_ACTION_LABELS[player1Action]} vence a ${FIGHT_ACTION_ICONS[player2Action]} ${FIGHT_ACTION_LABELS[player2Action]}.`,
    };
  }

  const damage = getWinningDamage(player2);

  return {
    resultType: 'player2Wins',
    player1Damage: applyResistance(player1, damage),
    player2Damage: 0,
    player1ScoreGain: FIGHT_ROUND_SCORE,
    player2ScoreGain:
      FIGHT_ROUND_SCORE +
      FIGHT_WIN_SCORE +
      (player2.consecutiveWins > 0 ? FIGHT_CONSECUTIVE_WIN_SCORE : 0),
    message: `Player 2 gana: ${FIGHT_ACTION_ICONS[player2Action]} ${FIGHT_ACTION_LABELS[player2Action]} vence a ${FIGHT_ACTION_ICONS[player1Action]} ${FIGHT_ACTION_LABELS[player1Action]}.`,
  };
}

export function doesFirstActionBeatSecond(
  firstAction: FightAction,
  secondAction: FightAction,
): boolean {
  return (
    (firstAction === 'punch' && secondAction === 'grab') ||
    (firstAction === 'kick' && secondAction === 'punch') ||
    (firstAction === 'grab' && secondAction === 'kick')
  );
}

export function getWinningDamage(winner: FightPlayer): number {
  if (winner.consecutiveWins > 0) {
    return FIGHT_BASE_DAMAGE + FIGHT_CONSECUTIVE_WIN_BONUS_DAMAGE;
  }

  return FIGHT_BASE_DAMAGE;
}

export function applyResistance(player: FightPlayer, damage: number): number {
  if (player.health < FIGHT_INITIAL_HEALTH / 2) {
    return Math.max(damage - FIGHT_LOW_HEALTH_RESISTANCE, 0);
  }

  return damage;
}

export function checkFinished(state: FightState): FightState {
  if (state.player1.health <= 0 && state.player2.health <= 0) {
    return {
      ...state,
      phase: 'finished',
      winnerId:
        state.player1.score >= state.player2.score ? 'player1' : 'player2',
      resultsCountdown: FIGHT_RESULTS_COUNTDOWN_SECONDS,
    };
  }

  if (state.player1.health <= 0) {
    return {
      ...state,
      phase: 'finished',
      winnerId: 'player2',
      resultsCountdown: FIGHT_RESULTS_COUNTDOWN_SECONDS,
    };
  }

  if (state.player2.health <= 0) {
    return {
      ...state,
      phase: 'finished',
      winnerId: 'player1',
      resultsCountdown: FIGHT_RESULTS_COUNTDOWN_SECONDS,
    };
  }

  return state;
}

export function startNextRound(state: FightState): FightState {
  return {
    ...state,
    phase: 'selecting',
    round: state.round + 1,
    selectionTimeLeft: FIGHT_SELECTION_SECONDS,
    resolutionTimeLeft: FIGHT_RESOLUTION_SECONDS,
    player1: {
      ...state.player1,
      selectedAction: undefined,
    },
    player2: {
      ...state.player2,
      selectedAction: undefined,
    },
  };
}

export function getWinnerName(state: FightState): string {
  if (state.winnerId === 'player1') {
    return state.player1.name;
  }

  if (state.winnerId === 'player2') {
    return state.player2.name;
  }

  return 'Unknown player';
}