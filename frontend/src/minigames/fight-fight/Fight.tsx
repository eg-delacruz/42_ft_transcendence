import { useEffect, useState } from 'react';
import { TopScores } from '../components/TopScores';
import { styles } from './Fight.styles';
import {
  createInitialFightState,
  getSelectionFromKey,
  selectAction,
  resolveRound,
  checkFinished,
  startNextRound,
  getWinnerName,
} from './Fight.logic';

import {
  FIGHT_ACTION_ICONS,
  FIGHT_ACTION_LABELS,
  FIGHT_INITIAL_HEALTH,
  FIGHT_PLAYER_1_CONTROLS_TEXT,
  FIGHT_PLAYER_2_CONTROLS_TEXT,
  FIGHT_SELECTION_SECONDS,
  type FightPlayer,
  type FightState,
} from './Fight.types';

type FightFightProps = {
  onExitToMenu?: () => void;
};

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
            controlsText={FIGHT_PLAYER_1_CONTROLS_TEXT}
          />

          <FightPlayerView
            player={fightState.player2}
            controlsText={FIGHT_PLAYER_2_CONTROLS_TEXT}
          />
        </section>

        {fightState.lastRoundResult && (
          <section style={styles.resultBox}>
            <p style={styles.resultMessage}>
              {fightState.lastRoundResult.message}
            </p>
          </section>
        )}

        <TopScores minigameId="fight-fight" />
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