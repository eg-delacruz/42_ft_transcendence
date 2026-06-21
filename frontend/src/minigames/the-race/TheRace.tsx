import { useEffect, useRef, useState } from 'react';

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

import { getRaceUserId } from './Race.users';

type TheRaceProps = {
  onExitToMenu?: () => void;
};

export function TheRace({ onExitToMenu }: TheRaceProps) {
  const [raceState, setRaceState] = useState<RaceState>(
    createInitialRaceState,
  );

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

  const winnerName = getRaceWinnerName(raceState);

  return (
    <main style={styles.page}>
      <TopScores minigameId="the-race" />

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
              <p style={styles.text}>
                {RACE_PLAYER_1_CONTROL_TEXT} | {RACE_PLAYER_2_CONTROL_TEXT}
              </p>
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