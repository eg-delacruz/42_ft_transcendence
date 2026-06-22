import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { TopScores } from '../components/TopScores';
import { updateMinigameTopScore } from '../components/TopScores.api';

import {
  advancePlayer,
  createInitialRaceState,
  getPlayerIdFromKey,
  getProgressPercentage,
  getRaceWinnerName,
} from './Race.logic';

import { styles } from './Race.styles';

import {
  RACE_GAME_COUNTDOWN_SECONDS,
  RACE_PLAYER_1_CONTROL_TEXT,
  RACE_PLAYER_2_CONTROL_TEXT,
  RACE_TARGET_SCORE,
  type RacePlayer,
  type RaceState,
} from './Race.types';

import { getRaceDisplayName, getRaceUserId } from './Race.users';

type TheRaceProps = {
  onExitToMenu?: () => void;
};

export function TheRace({ onExitToMenu }: TheRaceProps) {
  const [raceState, setRaceState] = useState<RaceState>(
    createInitialRaceState,
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const hasSubmittedScore = useRef(false);

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
    if (raceState.phase !== 'running') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [raceState.phase]);

  useEffect(() => {
    if (raceState.phase !== 'finished') {
      return;
    }

    if (!raceState.winnerId) {
      return;
    }

    if (hasSubmittedScore.current) {
      return;
    }

    const winner = raceState.players.find(
      (player) => player.id === raceState.winnerId,
    );

    if (!winner) {
      return;
    }

    hasSubmittedScore.current = true;

    const winnerUserId = getRaceUserId(raceState.winnerId);

    updateMinigameTopScore('the-race', winner.progress, winnerUserId).catch(
      (error) => {
        console.error('Error updating The Race top score:', error);
      },
    );
  }, [raceState.phase, raceState.winnerId, raceState.players]);

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

  const player1 = raceState.players[0];
  const player2 = raceState.players[1];
  const winnerName = getRaceWinnerName(raceState);

  return (
    <main style={styles.page}>
      <TopScores minigameId="the-race" />

      <section style={styles.board}>
        <aside style={styles.leftHud}>
          <section style={styles.hudCard}>
            <span style={styles.hudIcon}>◷</span>

            <div style={styles.hudTextGroup}>
              <p style={styles.hudLabel}>Tiempo:</p>
              <p style={styles.hudValue}>
                {getRaceTimeText(raceState, elapsedSeconds)}
              </p>
            </div>
          </section>

          <section style={styles.controlsCard}>
            <p style={styles.controlsTitle}>Control</p>
            <p style={styles.controlsKey}>↑</p>
            <p style={styles.controlsText}>Pulsa para avanzar</p>
          </section>
        </aside>

        <section style={styles.trackArea}>
          <RaceStatus raceState={raceState} winnerName={winnerName} />

          <div style={styles.track}>
            <div style={{ ...styles.trackLine, left: '28%' }} />
            <div style={{ ...styles.trackLine, left: '50%' }} />
            <div style={{ ...styles.trackLine, left: '72%' }} />

            <RaceRunner
              player={player1}
              color="blue"
              laneStyle={styles.runnerLaneLeft}
            />

            <RaceRunner
              player={player2}
              color="red"
              laneStyle={styles.runnerLaneRight}
            />

          </div>
        </section>

        <aside style={styles.rightPanel}>
          <section style={styles.raceInfoCard}>
            <p style={styles.raceInfoTitle}>Meta</p>
            <p style={styles.raceInfoValue}>{RACE_TARGET_SCORE}</p>
          </section>

          <section style={styles.raceInfoCard}>
            <p style={styles.raceInfoTitle}>Progreso</p>

            {raceState.players.map((player) => (
              <p key={player.id} style={styles.raceInfoText}>
                {getRaceDisplayName(player.id)}: {player.progress}
              </p>
            ))}
          </section>
        </aside>

        {raceState.phase === 'finished' && (
          <section style={styles.finishedOverlay}>
            <h2 style={styles.phaseTitle}>Carrera terminada</h2>

            <p style={styles.winnerText}>Ganador: {winnerName}</p>

            <p style={styles.text}>
              Volviendo al menú en {raceState.resultsCountdown}...
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function RaceStatus({
  raceState,
  winnerName,
}: {
  raceState: RaceState;
  winnerName: string;
}) {
  if (raceState.phase === 'bettingCountdown') {
    return (
      <section style={styles.statusFloatingBox}>
        <h2 style={styles.phaseTitle}>Apuestas</h2>
        <p style={styles.bigNumber}>{raceState.bettingCountdown}</p>
        <p style={styles.text}>La carrera empezará automáticamente.</p>
      </section>
    );
  }

  if (raceState.phase === 'gameCountdown') {
    return (
      <section style={styles.statusFloatingBox}>
        <h2 style={styles.phaseTitle}>Preparados</h2>
        <p style={styles.bigNumber}>{raceState.gameCountdown}</p>
        <p style={styles.text}>Todavía no pulses.</p>
      </section>
    );
  }

  if (raceState.phase === 'running') {
    return (
      <section style={styles.statusFloatingBox}>
        <h2 style={styles.phaseTitle}>¡Corre!</h2>
        <p style={styles.text}>
          {RACE_PLAYER_1_CONTROL_TEXT} | {RACE_PLAYER_2_CONTROL_TEXT}
        </p>
      </section>
    );
  }

  if (raceState.phase === 'finished') {
    return (
      <section style={styles.statusFloatingBox}>
        <h2 style={styles.phaseTitle}>Meta</h2>
        <p style={styles.winnerText}>{winnerName}</p>
      </section>
    );
  }

  return null;
}

function RaceRunner({
  player,
  color,
  laneStyle,
}: {
  player?: RacePlayer;
  color: 'blue' | 'red';
  laneStyle: CSSProperties;
}) {
  if (!player) {
    return null;
  }

  const progressPercentage = getProgressPercentage(player.progress);

  return (
    <article
      style={{
        ...styles.runner,
        ...laneStyle,
        bottom: `${progressPercentage}%`,
      }}
    >
      <div
        style={{
          ...styles.runnerHead,
          ...(color === 'blue' ? styles.blueRunner : styles.redRunner),
        }}
      />

      <div style={styles.horseBody}>♞</div>
    </article>
  );
}

function getRaceTimeText(
  raceState: RaceState,
  elapsedSeconds: number,
): string {
  if (raceState.phase === 'bettingCountdown') {
    return `00:${String(raceState.bettingCountdown).padStart(2, '0')}`;
  }

  if (raceState.phase === 'gameCountdown') {
    return `00:${String(raceState.gameCountdown).padStart(2, '0')}`;
  }

  return formatElapsedTime(elapsedSeconds);
}

function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
}