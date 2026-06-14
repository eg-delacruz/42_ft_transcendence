import { useEffect, useState } from 'react';

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
} from './fightTypes';

type FightFightProps = {
  onExitToMenu?: () => void;
};

function createInitialPlayer(id: FightPlayerId, name: string): FightPlayer {
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

function createInitialFightState(): FightState {
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

export function FightFight({ onExitToMenu }: FightFightProps) {
  const [fightState, setFightState] = useState<FightState>(
    createInitialFightState,
  );

  useEffect(() => {
    if (fightState.phase !== 'bettingCountdown') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFightState((currentState) => {
        if (currentState.phase !== 'bettingCountdown') {
          return currentState;
        }

        if (currentState.bettingCountdown <= 1) {
          return {
            ...currentState,
            phase: 'selecting',
            bettingCountdown: 0,
            selectionTimeLeft: FIGHT_SELECTION_SECONDS,
          };
        }

        return {
          ...currentState,
          bettingCountdown: currentState.bettingCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [fightState.phase, fightState.bettingCountdown]);

  useEffect(() => {
    if (fightState.phase !== 'selecting') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFightState((currentState) => {
        if (currentState.phase !== 'selecting') {
          return currentState;
        }

        if (currentState.selectionTimeLeft <= 1) {
          return resolveRound(currentState);
        }

        return {
          ...currentState,
          selectionTimeLeft: currentState.selectionTimeLeft - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [fightState.phase, fightState.selectionTimeLeft]);

  useEffect(() => {
    if (fightState.phase !== 'resolving') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFightState((currentState) => {
        if (currentState.phase !== 'resolving') {
          return currentState;
        }

        if (currentState.resolutionTimeLeft <= 1) {
          const finishedState = checkFinished(currentState);

          if (finishedState.phase === 'finished') {
            return finishedState;
          }

          return startNextRound(currentState);
        }

        return {
          ...currentState,
          resolutionTimeLeft: currentState.resolutionTimeLeft - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [fightState.phase, fightState.resolutionTimeLeft]);

  useEffect(() => {
    if (fightState.phase !== 'finished') {
      return;
    }

    if (fightState.resultsCountdown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFightState((currentState) => {
        if (currentState.phase !== 'finished') {
          return currentState;
        }

        return {
          ...currentState,
          resultsCountdown: currentState.resultsCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [fightState.phase, fightState.resultsCountdown]);

  useEffect(() => {
    if (fightState.phase === 'finished' && fightState.resultsCountdown <= 0) {
      onExitToMenu?.();
    }
  }, [fightState.phase, fightState.resultsCountdown, onExitToMenu]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      const selection = getSelectionFromKey(event.code);

      if (!selection) {
        return;
      }

      event.preventDefault();

      setFightState((currentState) =>
        selectAction(currentState, selection.playerId, selection.action),
      );
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <header style={styles.header}>
          <p style={styles.kicker}>Minigame</p>
          <h1 style={styles.title}>Fight Fight!</h1>
          <p style={styles.subtitle}>
            Elige acción antes de que termine el turno.
          </p>
        </header>

        <section style={styles.statusBox}>
          {fightState.phase === 'bettingCountdown' && (
            <>
              <h2 style={styles.phaseTitle}>Tiempo para apuestas</h2>
              <p style={styles.bigNumber}>{fightState.bettingCountdown}</p>
              <p style={styles.text}>
                El combate empezará automáticamente.
              </p>
            </>
          )}

          {fightState.phase === 'selecting' && (
            <>
              <h2 style={styles.phaseTitle}>Ronda {fightState.round}</h2>
              <p style={styles.bigNumber}>{fightState.selectionTimeLeft}</p>
              <p style={styles.text}>Elige tu acción.</p>
            </>
          )}

          {fightState.phase === 'resolving' && (
            <>
              <h2 style={styles.phaseTitle}>Resolviendo...</h2>
              <p style={styles.bigNumber}>{fightState.resolutionTimeLeft}</p>
            </>
          )}

          {fightState.phase === 'finished' && (
            <>
              <h2 style={styles.phaseTitle}>Combate terminado</h2>
              <p style={styles.winnerText}>
                Ganador: {getWinnerName(fightState)}
              </p>
              <p style={styles.text}>
                Volviendo al menú en {fightState.resultsCountdown}...
              </p>
            </>
          )}
        </section>

        <section style={styles.players}>
          <FightPlayerView
            player={fightState.player1}
            controlsText="← 👊 | → 🦵 | ↑ 🤼 | ↓ 💨"
          />

          <FightPlayerView
            player={fightState.player2}
            controlsText="A 👊 | D 🦵 | W 🤼 | S 💨"
          />
        </section>

        {fightState.lastRoundResult && (
          <section style={styles.resultBox}>
            <p style={styles.resultMessage}>
              {fightState.lastRoundResult.message}
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function FightPlayerView({
  player,
  controlsText,
}: {
  player: FightPlayer;
  controlsText: string;
}) {
  const healthPercentage = Math.max(
    (player.health / FIGHT_INITIAL_HEALTH) * 100,
    0,
  );

  return (
    <article style={styles.playerCard}>
      <div style={styles.playerHeader}>
        <h2 style={styles.playerName}>{player.name}</h2>
        <span style={styles.playerScore}>Score: {player.score}</span>
      </div>

      <div style={styles.healthTrack}>
        <div
          style={{
            ...styles.healthBar,
            width: `${healthPercentage}%`,
          }}
        />
      </div>

      <p style={styles.text}>
        Vida: {player.health} / {FIGHT_INITIAL_HEALTH}
      </p>

      <section style={styles.actionPanel}>
        <p style={styles.actionPanelTitle}>Elección</p>

        {player.previousAction ? (
          <div style={styles.previousActionBox}>
            <span style={styles.previousActionIcon}>
              {FIGHT_ACTION_ICONS[player.previousAction]}
            </span>
            <span style={styles.previousActionLabel}>
              {FIGHT_ACTION_LABELS[player.previousAction]}
            </span>
          </div>
        ) : (
          <div style={styles.previousActionBox}>
            <span style={styles.previousActionIcon}>❔</span>
            <span style={styles.previousActionLabel}>Sin elección</span>
          </div>
        )}

        <p style={styles.controlsText}>{controlsText}</p>

        <p style={styles.text}>
          Victorias consecutivas: {player.consecutiveWins}
        </p>
      </section>
    </article>
  );
}

function getSelectionFromKey(
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

function selectAction(
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

function resolveRound(state: FightState): FightState {
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

function calculateRoundResult(
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

function doesFirstActionBeatSecond(
  firstAction: FightAction,
  secondAction: FightAction,
): boolean {
  return (
    (firstAction === 'punch' && secondAction === 'grab') ||
    (firstAction === 'kick' && secondAction === 'punch') ||
    (firstAction === 'grab' && secondAction === 'kick')
  );
}

function getWinningDamage(winner: FightPlayer): number {
  if (winner.consecutiveWins > 0) {
    return FIGHT_BASE_DAMAGE + FIGHT_CONSECUTIVE_WIN_BONUS_DAMAGE;
  }

  return FIGHT_BASE_DAMAGE;
}

function applyResistance(player: FightPlayer, damage: number): number {
  if (player.health < FIGHT_INITIAL_HEALTH / 2) {
    return Math.max(damage - FIGHT_LOW_HEALTH_RESISTANCE, 0);
  }

  return damage;
}

function checkFinished(state: FightState): FightState {
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

function startNextRound(state: FightState): FightState {
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

function getWinnerName(state: FightState): string {
  if (state.winnerId === 'player1') {
    return state.player1.name;
  }

  if (state.winnerId === 'player2') {
    return state.player2.name;
  }

  return 'Unknown player';
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    background: '#101018',
    color: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    padding: '32px',
    boxSizing: 'border-box',
  },
  panel: {
    width: 'min(1100px, 95vw)',
    display: 'grid',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
  },
  kicker: {
    margin: 0,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
  },
  title: {
    margin: '8px 0',
    fontSize: '56px',
  },
  subtitle: {
    margin: 0,
    color: '#d4d4d8',
  },
  statusBox: {
    minHeight: '180px',
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  phaseTitle: {
    margin: 0,
    fontSize: '28px',
  },
  bigNumber: {
    margin: 0,
    fontSize: '72px',
    fontWeight: 700,
  },
  text: {
    margin: 0,
    color: '#d4d4d8',
  },
  winnerText: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
  },
  players: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
  },
  playerCard: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '24px',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',
  },
  playerName: {
    margin: 0,
    fontSize: '24px',
  },
  playerScore: {
    fontSize: '18px',
    color: '#d4d4d8',
  },
  healthTrack: {
    width: '100%',
    height: '32px',
    borderRadius: '999px',
    background: '#27272f',
    overflow: 'hidden',
    border: '1px solid #52525b',
    marginBottom: '16px',
  },
  healthBar: {
    height: '100%',
    background: '#f4f4f5',
    transition: 'width 160ms linear',
  },
  actionPanel: {
    marginTop: '16px',
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    background: '#101018',
    padding: '14px',
    textAlign: 'center',
  },
  actionPanelTitle: {
    margin: '0 0 8px',
    color: '#a1a1aa',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  previousActionBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  previousActionIcon: {
    fontSize: '42px',
  },
  previousActionLabel: {
    fontSize: '18px',
    fontWeight: 700,
  },
  controlsText: {
    margin: '8px 0 12px',
    fontSize: '20px',
  },
  resultBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    textAlign: 'center',
  },
  resultMessage: {
    margin: 0,
    color: '#d4d4d8',
    textAlign: 'center',
    fontSize: '18px',
  },
};