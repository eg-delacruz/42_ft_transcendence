import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { TopScores } from '../components/TopScores';
import { updateMinigameTopScore } from '../components/TopScores.api';

import {
  checkFinished,
  createInitialFightState,
  getSelectionFromKey,
  resolveRound,
  selectAction,
  startNextRound,
} from './Fight.logic';

import { styles } from './Fight.styles';

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

import { getFightDisplayName, getFightUserId } from './Fight.users';

type FightFightProps = {
  onExitToMenu?: () => void;
};

export function FightFight({ onExitToMenu }: FightFightProps) {
  const [fightState, setFightState] = useState<FightState>(
    createInitialFightState,
  );

  const hasSubmittedScore = useRef(false);

  const player1Name = getFightDisplayName('player1');
  const player2Name = getFightDisplayName('player2');

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

    if (!fightState.winnerId) {
      return;
    }

    if (hasSubmittedScore.current) {
      return;
    }

    hasSubmittedScore.current = true;

    const winner =
      fightState.winnerId === 'player1'
        ? fightState.player1
        : fightState.player2;

    const winnerUserId = getFightUserId(fightState.winnerId);

    updateMinigameTopScore('fight-fight', winner.score, winnerUserId).catch(
      (error) => {
        console.error('Error updating Fight Fight top score:', error);
      },
    );
  }, [
    fightState.phase,
    fightState.winnerId,
    fightState.player1,
    fightState.player2,
  ]);

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
      <TopScores minigameId="fight-fight" />

      <section style={styles.board}>
        <header style={styles.topHud} />

        <section style={styles.combatHud}>
          <FighterStatus
            player={fightState.player1}
            side="left"
            label={player1Name}
          />

          <FightClock fightState={fightState} />

          <FighterStatus
            player={fightState.player2}
            side="right"
            label={player2Name}
          />
        </section>

        <section style={styles.arena}>
          <DecisionDisplay player={fightState.player1} />

          <RoundResult
            fightState={fightState}
            player1Name={player1Name}
            player2Name={player2Name}
          />

          <DecisionDisplay player={fightState.player2} />
        </section>

        <ActionGuide />

        <section style={styles.hiddenControlsInfo}>
          <p style={styles.controlsText}>{FIGHT_PLAYER_1_CONTROLS_TEXT}</p>
          <p style={styles.controlsText}>{FIGHT_PLAYER_2_CONTROLS_TEXT}</p>
        </section>

        {fightState.phase === 'finished' && (
          <section style={styles.finishedOverlay}>
            <h2 style={styles.phaseTitle}>Combate terminado</h2>

            <p style={styles.winnerText}>
              Ganador: {getFightWinnerDisplayName(
                fightState,
                player1Name,
                player2Name,
              )}
            </p>

            <p style={styles.text}>
              Volviendo al menú en {fightState.resultsCountdown}...
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function FighterStatus({
  player,
  side,
  label,
}: {
  player: FightPlayer;
  side: 'left' | 'right';
  label: string;
}) {
  const healthPercentage = getHealthPercentage(player.health);

  return (
    <article
      style={{
        ...styles.fighterStatus,
        ...(side === 'right' ? styles.fighterStatusRight : {}),
      }}
    >
      <h2
        style={{
          ...styles.fighterLabel,
          ...(side === 'right' ? styles.rivalLabel : styles.playerLabel),
        }}
      >
        <span>{label}</span>
        <span style={styles.fighterScore}>{player.score} pts</span>
      </h2>

      <div style={styles.healthTrack}>
        <div
          style={{
            ...styles.healthBar,
            ...(side === 'right'
              ? styles.rivalHealthBar
              : styles.playerHealthBar),
            width: `${healthPercentage}%`,
          }}
        />
      </div>
    </article>
  );
}

function FightClock({ fightState }: { fightState: FightState }) {
  return (
    <section style={styles.clockArea}>
      <article style={styles.clockBox}>
        <p style={styles.clockLabel}>{getClockLabel(fightState)}</p>
        <p style={styles.clockNumber}>{getClockValue(fightState)}</p>
      </article>

      <p style={styles.roundText}>Ronda {fightState.round}</p>
    </section>
  );
}

function DecisionDisplay({ player }: { player: FightPlayer }) {
  const displayedAction = getDisplayedAction(player);

  return (
    <article style={styles.decisionSide}>
      <p style={styles.decisionIcon}>
        {displayedAction ? FIGHT_ACTION_ICONS[displayedAction] : '❔'}
      </p>

      <p style={styles.decisionName}>
        {displayedAction
          ? FIGHT_ACTION_LABELS[displayedAction]
          : 'Sin acción'}
      </p>

      <p style={styles.decisionStreak}>Racha: {player.consecutiveWins}</p>
    </article>
  );
}

function RoundResult({
  fightState,
  player1Name,
  player2Name,
}: {
  fightState: FightState;
  player1Name: string;
  player2Name: string;
}) {
  if (fightState.phase === 'bettingCountdown') {
    return (
      <section style={styles.centerArenaMessage}>
        <p style={styles.phaseTitle}>Apuestas</p>
        <p style={styles.text}>El combate empezará automáticamente.</p>
      </section>
    );
  }

  if (fightState.phase === 'selecting') {
    return (
      <section style={styles.centerArenaMessage}>
        <p style={styles.phaseTitle}>Elige acción</p>
        <p style={styles.text}>Tienes {fightState.selectionTimeLeft}s.</p>
      </section>
    );
  }

  if (fightState.phase === 'resolving') {
    return (
      <section style={styles.centerArenaMessage}>
        <p style={styles.phaseTitle}>Resolviendo</p>

        {fightState.lastRoundResult ? (
          <p style={styles.resultMessage}>
            {fightState.lastRoundResult.message}
          </p>
        ) : (
          <p style={styles.text}>Comparando acciones...</p>
        )}
      </section>
    );
  }

  if (fightState.phase === 'finished') {
    return (
      <section style={styles.centerArenaMessage}>
        <p style={styles.phaseTitle}>KO</p>

        <p style={styles.resultMessage}>
          {getFightWinnerDisplayName(fightState, player1Name, player2Name)}
        </p>
      </section>
    );
  }

  return null;
}

function ActionGuide() {
  return (
    <section style={styles.actionGuide}>
      <ActionGuideItem
        arrow="←"
        name="Puñetazo"
        colorStyle={styles.playerLabel}
        rule={
          <>
            <ActionKeyword colorStyle={styles.playerLabel}>
              Puñetazo
            </ActionKeyword>{' '}
            gana a{' '}
            <ActionKeyword colorStyle={styles.grabLabel}>
              Agarre
            </ActionKeyword>
          </>
        }
      />

      <ActionGuideItem
        arrow="↑"
        name="Agarre"
        colorStyle={styles.grabLabel}
        rule={
          <>
            <ActionKeyword colorStyle={styles.grabLabel}>
              Agarre
            </ActionKeyword>{' '}
            gana a{' '}
            <ActionKeyword colorStyle={styles.rivalLabel}>
              Patada
            </ActionKeyword>
          </>
        }
      />

      <ActionGuideItem
        arrow="→"
        name="Patada"
        colorStyle={styles.rivalLabel}
        rule={
          <>
            <ActionKeyword colorStyle={styles.rivalLabel}>
              Patada
            </ActionKeyword>{' '}
            gana a{' '}
            <ActionKeyword colorStyle={styles.playerLabel}>
              Puñetazo
            </ActionKeyword>
          </>
        }
      />

      <ActionGuideItem
        arrow="↓"
        name="Esquiva"
        colorStyle={styles.dodgeLabel}
        rule={
          <>
            <ActionKeyword colorStyle={styles.dodgeLabel}>
              Esquiva
            </ActionKeyword>{' '}
            evita daño
          </>
        }
      />
    </section>
  );
}

function ActionGuideItem({
  arrow,
  name,
  rule,
  colorStyle,
}: {
  arrow: string;
  name: string;
  rule: ReactNode;
  colorStyle: CSSProperties;
}) {
  return (
    <article style={styles.actionGuideItem}>
      <div style={styles.keyBox}>{arrow}</div>

      <div style={styles.actionGuideText}>
        <p style={{ ...styles.actionName, ...colorStyle }}>{name}</p>
        <p style={styles.actionRule}>{rule}</p>
      </div>
    </article>
  );
}

function getDisplayedAction(player: FightPlayer) {
  const playerWithSelection = player as FightPlayer & {
    selectedAction?: keyof typeof FIGHT_ACTION_LABELS | null;
  };

  return playerWithSelection.selectedAction ?? player.previousAction ?? null;
}

function getHealthPercentage(health: number): number {
  return Math.max((health / FIGHT_INITIAL_HEALTH) * 100, 0);
}

function getClockLabel(fightState: FightState): string {
  if (fightState.phase === 'bettingCountdown') {
    return 'Apuestas';
  }

  if (fightState.phase === 'resolving') {
    return 'Golpe';
  }

  if (fightState.phase === 'finished') {
    return 'Final';
  }

  return 'Tiempo';
}

function getClockValue(fightState: FightState): string {
  if (fightState.phase === 'bettingCountdown') {
    return formatClockNumber(fightState.bettingCountdown);
  }

  if (fightState.phase === 'selecting') {
    return formatClockNumber(fightState.selectionTimeLeft);
  }

  if (fightState.phase === 'resolving') {
    return formatClockNumber(fightState.resolutionTimeLeft);
  }

  if (fightState.phase === 'finished') {
    return formatClockNumber(fightState.resultsCountdown);
  }

  return '00';
}

function formatClockNumber(value: number): string {
  return String(Math.max(value, 0)).padStart(2, '0');
}

function getFightWinnerDisplayName(
  fightState: FightState,
  player1Name: string,
  player2Name: string,
): string {
  if (fightState.winnerId === 'player1') {
    return player1Name;
  }

  if (fightState.winnerId === 'player2') {
    return player2Name;
  }

  return 'Sin ganador';
}


function ActionKeyword({
  children,
  colorStyle,
}: {
  children: ReactNode;
  colorStyle: CSSProperties;
}) {
  return <span style={{ ...styles.actionRuleKeyword, ...colorStyle }}>{children}</span>;
}