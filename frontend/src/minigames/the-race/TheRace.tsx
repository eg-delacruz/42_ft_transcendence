import { useEffect, useState } from 'react';

import {
  RACE_BETTING_COUNTDOWN_SECONDS,
  RACE_GAME_COUNTDOWN_SECONDS,
  RACE_PLAYER_1_KEY,
  RACE_PLAYER_2_KEY,
  RACE_RESULTS_COUNTDOWN_SECONDS,
  RACE_TARGET_SCORE,
  type RacePlayer,
  type RacePlayerId,
  type RaceState,
} from './raceTypes';

type TheRaceProps = {
  onExitToMenu?: () => void;
};

function createInitialRaceState(): RaceState {
  return {
    phase: 'bettingCountdown',
    bettingCountdown: RACE_BETTING_COUNTDOWN_SECONDS,
    gameCountdown: RACE_GAME_COUNTDOWN_SECONDS,
    resultsCountdown: RACE_RESULTS_COUNTDOWN_SECONDS,
    players: [
      {
        id: 'player1',
        name: 'Player 1',
        progress: 0,
      },
      {
        id: 'player2',
        name: 'Player 2',
        progress: 0,
      },
    ],
    winnerId: undefined,
  };
}

export function TheRace({ onExitToMenu }: TheRaceProps) {
  const [raceState, setRaceState] = useState<RaceState>(createInitialRaceState);

  useEffect(() => {
    if (raceState.phase !== 'bettingCountdown') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRaceState((currentState) => {
        if (currentState.phase !== 'bettingCountdown') {
          return currentState;
        }

        if (currentState.bettingCountdown <= 1) {
          return {
            ...currentState,
            phase: 'gameCountdown',
            bettingCountdown: 0,
            gameCountdown: RACE_GAME_COUNTDOWN_SECONDS,
          };
        }

        return {
          ...currentState,
          bettingCountdown: currentState.bettingCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [raceState.phase]);

  useEffect(() => {
    if (raceState.phase !== 'gameCountdown') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRaceState((currentState) => {
        if (currentState.phase !== 'gameCountdown') {
          return currentState;
        }

        if (currentState.gameCountdown <= 1) {
          return {
            ...currentState,
            phase: 'running',
            gameCountdown: 0,
          };
        }

        return {
          ...currentState,
          gameCountdown: currentState.gameCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [raceState.phase]);

useEffect(() => {
  if (raceState.phase !== 'finished') {
    return;
  }

  if (raceState.resultsCountdown <= 0) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    setRaceState((currentState) => {
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
}, [raceState.phase, raceState.resultsCountdown]);

useEffect(() => {
  if (raceState.phase === 'finished' && raceState.resultsCountdown <= 0) {
    onExitToMenu?.();
  }
}, [raceState.phase, raceState.resultsCountdown, onExitToMenu]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      const playerId = getPlayerIdFromKey(event.code);

      if (!playerId) {
        return;
      }

      event.preventDefault();

      setRaceState((currentState) => advancePlayer(currentState, playerId));
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const winnerName = getRaceWinnerName(raceState);

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <header style={styles.header}>
          <p style={styles.kicker}>Minigame</p>
          <h1 style={styles.title}>The Race</h1>
          <p style={styles.subtitle}>
            Primer jugador en llegar a {RACE_TARGET_SCORE}.
          </p>
        </header>

        <section style={styles.statusBox}>
          {raceState.phase === 'bettingCountdown' && (
            <>
              <h2 style={styles.phaseTitle}>Tiempo para apuestas</h2>
              <p style={styles.bigNumber}>{raceState.bettingCountdown}</p>
              <p style={styles.text}>
                La carrera empezará automáticamente.
              </p>
            </>
          )}

          {raceState.phase === 'gameCountdown' && (
            <>
              <h2 style={styles.phaseTitle}>Preparados...</h2>
              <p style={styles.bigNumber}>{raceState.gameCountdown}</p>
              <p style={styles.text}>Todavía no pulses.</p>
            </>
          )}

          {raceState.phase === 'running' && (
            <>
              <h2 style={styles.phaseTitle}>¡Corre!</h2>
              <p style={styles.text}>↑ Player 1 | A Player 2</p>
            </>
          )}

          {raceState.phase === 'finished' && (
            <>
              <h2 style={styles.phaseTitle}>Carrera terminada</h2>
              <p style={styles.winnerText}>Ganador: {winnerName}</p>
              <p style={styles.text}>
                Volviendo al menú en {raceState.resultsCountdown}...
              </p>
            </>
          )}
        </section>

        <section style={styles.players}>
          {raceState.players.map((player) => (
            <RacePlayerView key={player.id} player={player} />
          ))}
        </section>
      </section>
    </main>
  );
}

function RacePlayerView({ player }: { player: RacePlayer }) {
  const progressPercentage = getProgressPercentage(player.progress);

  return (
    <article style={styles.playerCard}>
      <div style={styles.playerHeader}>
        <h2 style={styles.playerName}>{player.name}</h2>
        <span style={styles.playerScore}>
          {player.progress} / {RACE_TARGET_SCORE}
        </span>
      </div>

      <div style={styles.track}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progressPercentage}%`,
          }}
        />
      </div>
    </article>
  );
}

function getPlayerIdFromKey(code: string): RacePlayerId | null {
  if (code === RACE_PLAYER_1_KEY) {
    return 'player1';
  }

  if (code === RACE_PLAYER_2_KEY) {
    return 'player2';
  }

  return null;
}

function advancePlayer(
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

function getRaceWinnerName(state: RaceState): string {
  const winner = state.players.find((player) => player.id === state.winnerId);
  return winner?.name ?? 'Unknown player';
}

function getProgressPercentage(progress: number): number {
  return Math.min((progress / RACE_TARGET_SCORE) * 100, 100);
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
    width: 'min(1000px, 95vw)',
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
  track: {
    width: '100%',
    height: '32px',
    borderRadius: '999px',
    background: '#27272f',
    overflow: 'hidden',
    border: '1px solid #52525b',
  },
  progressBar: {
    height: '100%',
    background: '#f4f4f5',
    transition: 'width 80ms linear',
  },
};