import { useEffect, useRef, useState } from 'react';

import { TopScores } from '../components/TopScores';
import { updateMinigameTopScore } from '../components/TopScores.api';

import {
  chooseClass,
  createInitialDungeonState,
  finishAsDead,
  getVisualCardSlots,
  handleDungeonKey,
  resolveCardChoice,
  startNewRoom,
} from './DDD.logic';

import { styles } from './DDD.styles';

import {
  DUNGEON_CARD_CONTROL_TEXT,
  DUNGEON_CLASS_CONTROL_LABELS,
  DUNGEON_CLASS_CONTROL_TEXT,
  DUNGEON_CLASS_ICONS,
  DUNGEON_CLASS_LABELS,
  DUNGEON_CLASS_SELECTION_SECONDS,
  DUNGEON_EFFECT_ICONS,
  DUNGEON_EFFECT_LABELS,
  DUNGEON_INITIAL_HEALTH,
  DUNGEON_RESOLVE_SECONDS,
  type DungeonClass,
  type DungeonState,
} from './DDD.types';

import { getDungeonUserId } from './DDD.users';

type DeepDarkDungeonProps = {
  onExitToMenu?: () => void;
};

export function DeepDarkDungeon({ onExitToMenu }: DeepDarkDungeonProps) {
  const [dungeonState, setDungeonState] = useState<DungeonState>(
    createInitialDungeonState,
  );

  const hasSubmittedScore = useRef(false);

  useEffect(() => {
    if (dungeonState.phase !== 'bettingCountdown') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDungeonState((currentState) => {
        if (currentState.phase !== 'bettingCountdown') {
          return currentState;
        }

        if (currentState.bettingCountdown <= 1) {
          return {
            ...currentState,
            phase: 'choosingClass',
            bettingCountdown: 0,
            classSelectionCountdown: DUNGEON_CLASS_SELECTION_SECONDS,
          };
        }

        return {
          ...currentState,
          bettingCountdown: currentState.bettingCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [dungeonState.phase, dungeonState.bettingCountdown]);

  useEffect(() => {
    if (dungeonState.phase !== 'choosingClass') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDungeonState((currentState) => {
        if (currentState.phase !== 'choosingClass') {
          return currentState;
        }

        if (currentState.classSelectionCountdown <= 1) {
          return chooseClass(currentState, 'warrior');
        }

        return {
          ...currentState,
          classSelectionCountdown: currentState.classSelectionCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [dungeonState.phase, dungeonState.classSelectionCountdown]);

  useEffect(() => {
    if (dungeonState.phase !== 'drawingCards') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDungeonState((currentState) => {
        if (currentState.phase !== 'drawingCards') {
          return currentState;
        }

        return startNewRoom(currentState);
      });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [dungeonState.phase]);

  useEffect(() => {
    if (dungeonState.phase !== 'choosingCard') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDungeonState((currentState) => {
        if (currentState.phase !== 'choosingCard') {
          return currentState;
        }

        if (currentState.cardSelectionCountdown <= 1) {
          return resolveCardChoice(currentState, 0);
        }

        return {
          ...currentState,
          cardSelectionCountdown: currentState.cardSelectionCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [dungeonState.phase, dungeonState.cardSelectionCountdown]);

  useEffect(() => {
    if (dungeonState.phase !== 'resolvingRoom') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDungeonState((currentState) => {
        if (currentState.phase !== 'resolvingRoom') {
          return currentState;
        }

        if (currentState.resolveCountdown <= 1) {
          if (currentState.player.health <= 0) {
            return finishAsDead(currentState);
          }

          return {
            ...currentState,
            phase: 'drawingCards',
            resolveCountdown: DUNGEON_RESOLVE_SECONDS,
          };
        }

        return {
          ...currentState,
          resolveCountdown: currentState.resolveCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [dungeonState.phase, dungeonState.resolveCountdown]);

  useEffect(() => {
    const shouldSubmitScore =
      dungeonState.phase === 'escaped' ||
      dungeonState.phase === 'dead' ||
      dungeonState.phase === 'finished';

    if (!shouldSubmitScore) {
      return;
    }

    if (hasSubmittedScore.current) {
      return;
    }

    hasSubmittedScore.current = true;

    updateMinigameTopScore(
      'deep-dark-dungeon',
      dungeonState.player.score,
      getDungeonUserId(),
    ).catch((error) => {
      console.error('Error updating Deep & Dark Dungeon top score:', error);
    });
  }, [dungeonState.phase, dungeonState.player.score]);

  useEffect(() => {
    const shouldCountResults =
      dungeonState.phase === 'escaped' ||
      dungeonState.phase === 'dead' ||
      dungeonState.phase === 'finished';

    if (!shouldCountResults || dungeonState.resultsCountdown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDungeonState((currentState) => {
        if (
          currentState.phase !== 'escaped' &&
          currentState.phase !== 'dead' &&
          currentState.phase !== 'finished'
        ) {
          return currentState;
        }

        return {
          ...currentState,
          resultsCountdown: currentState.resultsCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [dungeonState.phase, dungeonState.resultsCountdown]);

  useEffect(() => {
    const shouldExit =
      (dungeonState.phase === 'escaped' ||
        dungeonState.phase === 'dead' ||
        dungeonState.phase === 'finished') &&
      dungeonState.resultsCountdown <= 0;

    if (shouldExit) {
      onExitToMenu?.();
    }
  }, [dungeonState.phase, dungeonState.resultsCountdown, onExitToMenu]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      if (
        dungeonState.phase !== 'choosingClass' &&
        dungeonState.phase !== 'choosingCard'
      ) {
        return;
      }

      const nextState = handleDungeonKey(dungeonState, event.code);

      if (!nextState) {
        return;
      }

      event.preventDefault();
      setDungeonState(nextState);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dungeonState]);

  return (
    <main style={styles.page}>
      <TopScores minigameId="deep-dark-dungeon" />

      <section style={styles.panel}>
        <header style={styles.header}>
          <p style={styles.kicker}>Minigame</p>
          <h1 style={styles.title}>Deep & Dark Dungeon</h1>
          <p style={styles.subtitle}>
            Elige clase, supera salas y escapa antes de morir.
          </p>
        </header>

        <section style={styles.statusBox}>
          {dungeonState.phase === 'bettingCountdown' && (
            <>
              <h2 style={styles.phaseTitle}>Tiempo para apuestas</h2>
              <p style={styles.bigNumber}>{dungeonState.bettingCountdown}</p>
              <p style={styles.text}>
                La exploración empezará automáticamente.
              </p>
            </>
          )}

          {dungeonState.phase === 'choosingClass' && (
            <>
              <h2 style={styles.phaseTitle}>Elige clase</h2>
              <p style={styles.bigNumber}>
                {dungeonState.classSelectionCountdown}
              </p>

              <section style={styles.classOptions}>
                <ClassOption dungeonClass="mague" />
                <ClassOption dungeonClass="warrior" />
                <ClassOption dungeonClass="rogue" />
              </section>

              <p style={styles.text}>{DUNGEON_CLASS_CONTROL_TEXT}</p>
              <p style={styles.text}>
                Si no eliges, se seleccionará Warrior.
              </p>
            </>
          )}

          {dungeonState.phase === 'drawingCards' && (
            <>
              <h2 style={styles.phaseTitle}>Entrando en una sala...</h2>
              <p style={styles.text}>Robando 3 cartas.</p>
            </>
          )}

          {dungeonState.phase === 'choosingCard' && (
            <>
              <h2 style={styles.phaseTitle}>Elige una carta</h2>
              <p style={styles.bigNumber}>
                {dungeonState.cardSelectionCountdown}
              </p>
              <p style={styles.text}>{DUNGEON_CARD_CONTROL_TEXT}</p>
            </>
          )}

          {dungeonState.phase === 'resolvingRoom' && (
            <>
              <h2 style={styles.phaseTitle}>Resolviendo sala...</h2>
              <p style={styles.bigNumber}>{dungeonState.resolveCountdown}</p>
              <p style={styles.text}>
                {dungeonState.lastTurnResult?.message}
              </p>
            </>
          )}

          {dungeonState.phase === 'escaped' && (
            <>
              <h2 style={styles.phaseTitle}>Has escapado</h2>
              <p style={styles.winnerText}>
                Score final: {dungeonState.player.score}
              </p>
              <p style={styles.text}>
                Volviendo al menú en {dungeonState.resultsCountdown}...
              </p>
            </>
          )}

          {dungeonState.phase === 'dead' && (
            <>
              <h2 style={styles.phaseTitle}>Has muerto</h2>
              <p style={styles.winnerText}>
                Score final: {dungeonState.player.score}
              </p>
              <p style={styles.text}>
                Volviendo al menú en {dungeonState.resultsCountdown}...
              </p>
            </>
          )}
        </section>

        <section style={styles.playerBox}>
          <h2 style={styles.sectionTitle}>Jugador</h2>

          <p style={styles.text}>
            Clase:{' '}
            {dungeonState.player.class
              ? `${DUNGEON_CLASS_ICONS[dungeonState.player.class]} ${
                  DUNGEON_CLASS_LABELS[dungeonState.player.class]
                }`
              : 'Sin elegir'}
          </p>

          <p style={styles.text}>
            Vida: {dungeonState.player.health} / {DUNGEON_INITIAL_HEALTH}
          </p>

          <p style={styles.text}>Score: {dungeonState.player.score}</p>
          <p style={styles.text}>Racha: {dungeonState.player.streak}</p>
          <p style={styles.text}>
            Salas superadas: {dungeonState.player.roundsSurvived}
          </p>
        </section>

        {dungeonState.phase === 'choosingCard' && dungeonState.currentRoom && (
          <section style={styles.roomBox}>
            <h2 style={styles.sectionTitle}>Sala actual</h2>
            <p style={styles.roomIcon}>{dungeonState.currentRoom.icon}</p>
            <p style={styles.roomName}>{dungeonState.currentRoom.name}</p>
          </section>
        )}

        {dungeonState.phase === 'choosingCard' && (
          <section style={styles.cards}>
            {getVisualCardSlots(dungeonState.hand).map(
              ({ card, originalIndex, label }) => (
                <article key={`${card.id}-${originalIndex}`} style={styles.card}>
                  <p style={styles.cardKey}>{label}</p>
                  <p style={styles.cardIcon}>{card.icon}</p>
                  <h3 style={styles.cardTitle}>{card.name}</h3>

                  <div style={styles.effectIcons}>
                    {card.effects.map((effect) => (
                      <span key={effect} title={DUNGEON_EFFECT_LABELS[effect]}>
                        {DUNGEON_EFFECT_ICONS[effect]}
                      </span>
                    ))}
                  </div>
                </article>
              ),
            )}
          </section>
        )}

        {dungeonState.lastTurnResult && (
          <section style={styles.resultBox}>
            <p style={styles.text}>{dungeonState.lastTurnResult.message}</p>
          </section>
        )}
      </section>
    </main>
  );
}

function ClassOption({ dungeonClass }: { dungeonClass: DungeonClass }) {
  return (
    <article style={styles.classCard}>
      <p style={styles.classKey}>
        {DUNGEON_CLASS_CONTROL_LABELS[dungeonClass]}
      </p>
      <p style={styles.classIcon}>{DUNGEON_CLASS_ICONS[dungeonClass]}</p>
      <p style={styles.className}>{DUNGEON_CLASS_LABELS[dungeonClass]}</p>
    </article>
  );
}