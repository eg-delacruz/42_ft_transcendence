import { useEffect, useRef, useState } from 'react';

import { TopScores } from '../components/TopScores';
import { updateMinigameTopScore } from '../components/TopScores.api';

import {
  chooseClass,
  createInitialDungeonState,
  finishAsDead,
  getVisualCardSlots,
  handleDungeonKey,
  prepareNextDungeonStep,
  resolveCardChoice,
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

        return prepareNextDungeonStep(currentState);
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

  const shouldShowClassSelection = dungeonState.phase === 'choosingClass';

  const shouldShowHand =
    dungeonState.phase === 'choosingCard' ||
    dungeonState.phase === 'resolvingRoom';

  return (
    <main style={styles.page}>
      <TopScores minigameId="deep-dark-dungeon" />

      <section style={styles.board}>
        <header style={styles.header}>
          <p style={styles.kicker}>Minigame</p>
          <h1 style={styles.title}>Deep & Dark Dungeon</h1>
          <p style={styles.subtitle}>
            Elige clase, supera salas y escapa antes de morir.
          </p>
        </header>

        <section style={styles.topGameArea}>
          <PlayerHud dungeonState={dungeonState} />
          <ActiveChallenge dungeonState={dungeonState} />
        </section>

        <div style={styles.boardDivider} />

        <section style={styles.bottomGameArea}>
          {dungeonState.phase === 'bettingCountdown' && (
            <section style={styles.bottomMessageBox}>
              <h2 style={styles.phaseTitle}>Preparando expedición</h2>
              <p style={styles.text}>
                La exploración empezará cuando termine el tiempo de apuestas.
              </p>
            </section>
          )}

          {shouldShowClassSelection && (
            <section style={styles.classSelectionArea}>
              <p style={styles.handSideLabel}>Clases disponibles</p>

              <section style={styles.classOptions}>
                <ClassOption dungeonClass="mague" />
                <ClassOption dungeonClass="warrior" />
                <ClassOption dungeonClass="rogue" />
              </section>

              <p style={styles.controlsHint}>{DUNGEON_CLASS_CONTROL_TEXT}</p>
              <p style={styles.text}>Si no eliges, se seleccionará Warrior.</p>
            </section>
          )}

          {dungeonState.phase === 'drawingCards' && (
            <section style={styles.bottomMessageBox}>
              <h2 style={styles.phaseTitle}>Robando cartas...</h2>
              <p style={styles.text}>
                {isContinuingCurrentRoom(dungeonState)
                  ? 'El reto continúa. Robando nuevas cartas para intentarlo de nuevo.'
                  : 'Preparando la siguiente sala.'}
              </p>
            </section>
          )}

          {shouldShowHand && (
            <section style={styles.handArea}>
              <div style={styles.handHeader}>
                <p style={styles.handSideLabel}>Cartas del jugador</p>
                <span style={styles.handArrow}>→</span>
              </div>

              <section style={styles.cards}>
                {getVisualCardSlots(dungeonState.hand).map(
                  ({ card, originalIndex, label }) => (
                    <article
                      key={`${card.id}-${originalIndex}`}
                      style={styles.card}
                    >
                      <p style={styles.cardKey}>{label}</p>
                      <h3 style={styles.cardTitle}>{card.name}</h3>
                      <p style={styles.cardIcon}>{card.icon}</p>

                      <div style={styles.effectList}>
                        {card.effects.map((effect) => (
                          <p key={effect} style={styles.effectText}>
                            <span style={styles.effectIcon}>
                              {DUNGEON_EFFECT_ICONS[effect]}
                            </span>{' '}
                            {DUNGEON_EFFECT_LABELS[effect]}
                          </p>
                        ))}
                      </div>
                    </article>
                  ),
                )}
              </section>

              <p style={styles.controlsHint}>{DUNGEON_CARD_CONTROL_TEXT}</p>
            </section>
          )}

          {(dungeonState.phase === 'escaped' ||
            dungeonState.phase === 'dead' ||
            dungeonState.phase === 'finished') && (
            <section style={styles.bottomMessageBox}>
              <h2 style={styles.phaseTitle}>
                {getResultTitle(dungeonState)}
              </h2>

              <p style={styles.winnerText}>
                Score final: {dungeonState.player.score}
              </p>

              <p style={styles.text}>
                Volviendo al menú en {dungeonState.resultsCountdown}...
              </p>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

function PlayerHud({ dungeonState }: { dungeonState: DungeonState }) {
  const selectedClass = dungeonState.player.class;

  return (
    <aside style={styles.playerHud}>
      <HudRow
        label="Clase"
        value={
          selectedClass
            ? `${DUNGEON_CLASS_ICONS[selectedClass]} ${
                DUNGEON_CLASS_LABELS[selectedClass]
              }`
            : 'Sin elegir'
        }
      />

      <div style={styles.hudRow}>
        <span style={styles.hudLabel}>Vida:</span>
        <span style={styles.hearts}>
          {renderHearts(dungeonState.player.health)}
        </span>
      </div>

      <HudRow label="Puntos" value={String(dungeonState.player.score)} />

      <HudRow
        label="Racha"
        value={`${dungeonState.player.streak} ${
          dungeonState.player.streak > 0 ? '🔥' : ''
        }`}
      />

      <HudRow label="Tiempo" value={getDungeonTimeText(dungeonState)} />

      <HudRow
        label="Salas"
        value={String(dungeonState.player.roundsSurvived)}
      />
    </aside>
  );
}

function HudRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.hudRow}>
      <span style={styles.hudLabel}>{label}:</span>
      <span style={styles.hudValue}>{value}</span>
    </div>
  );
}

function ActiveChallenge({ dungeonState }: { dungeonState: DungeonState }) {
  if (dungeonState.phase === 'bettingCountdown') {
    return (
      <section style={styles.challengeArea}>
        <p style={styles.challengeLabel}>Reto activo</p>

        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>Apuestas</h2>
          <p style={styles.bigNumber}>{dungeonState.bettingCountdown}</p>
          <p style={styles.challengeDescription}>
            Elige una clase y adéntrate en la mazmorra. Cada ronda te enfrentarás a una
            sala de combate, trampa o sala vacía, y robarás 3 cartas para intentar
            superarla. Si la carta no resuelve el reto, la sala continuará y tendrás que
            seguir intentándolo con nuevas cartas. Algunas cartas evitan daño, curan o dan
            puntos extra, pero no siempre superan la sala. Puedes abandonar usando ↓ para
            conservar tu puntuación; si mueres, perderás parte del score acumulado.
          </p>
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'choosingClass') {
    return (
      <section style={styles.challengeArea}>
        <p style={styles.challengeLabel}>Reto activo</p>

        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>Elige clase</h2>
          <p style={styles.bigNumber}>
            {dungeonState.classSelectionCountdown}
          </p>
          <p style={styles.challengeDescription}>
            Selecciona una clase para empezar la expedición.
          </p>
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'drawingCards') {
    const shouldContinueRoom = isContinuingCurrentRoom(dungeonState);

    return (
      <section style={styles.challengeArea}>
        <p style={styles.challengeLabel}>Reto activo</p>

        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>
            {shouldContinueRoom && dungeonState.currentRoom
              ? dungeonState.currentRoom.name
              : 'Nueva sala'}
          </h2>

          <p style={styles.roomIcon}>
            {shouldContinueRoom && dungeonState.currentRoom
              ? dungeonState.currentRoom.icon
              : '🃏'}
          </p>

          <p style={styles.challengeDescription}>
            {shouldContinueRoom && dungeonState.currentRoom
              ? 'El reto no se ha superado todavía. Robando nuevas cartas.'
              : 'Robando cartas y preparando el siguiente reto.'}
          </p>
        </article>
      </section>
    );
  }

  if (
    (dungeonState.phase === 'choosingCard' ||
      dungeonState.phase === 'resolvingRoom') &&
    dungeonState.currentRoom
  ) {
    return (
      <section style={styles.challengeArea}>
        <p style={styles.challengeLabel}>Reto activo</p>

        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>
            {dungeonState.currentRoom.name}
          </h2>

          <p style={styles.roomIcon}>{dungeonState.currentRoom.icon}</p>

          <p style={styles.challengeDescription}>
            {getRoomDescription(dungeonState.currentRoom.name)}
          </p>

          {dungeonState.phase === 'choosingCard' && (
            <p style={styles.challengeTimer}>
              {dungeonState.cardSelectionCountdown}s para elegir carta
            </p>
          )}

          {dungeonState.phase === 'resolvingRoom' && (
            <>
              <p style={styles.challengeTimer}>
                {dungeonState.resolveCountdown}s resolviendo
              </p>

              {dungeonState.lastTurnResult && (
                <p style={styles.resultText}>
                  {dungeonState.lastTurnResult.message}
                </p>
              )}
            </>
          )}
        </article>
      </section>
    );
  }

  if (
    dungeonState.phase === 'escaped' ||
    dungeonState.phase === 'dead' ||
    dungeonState.phase === 'finished'
  ) {
    return (
      <section style={styles.challengeArea}>
        <p style={styles.challengeLabel}>Reto activo</p>

        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>
            {getResultTitle(dungeonState)}
          </h2>

          <p style={styles.roomIcon}>
            {dungeonState.phase === 'escaped' ? '🚪' : '💀'}
          </p>

          <p style={styles.challengeDescription}>
            Score final: {dungeonState.player.score}
          </p>
        </article>
      </section>
    );
  }

  return (
    <section style={styles.challengeArea}>
      <p style={styles.challengeLabel}>Reto activo</p>

      <article style={styles.challengeCard}>
        <h2 style={styles.challengeTitle}>Mazmorra</h2>
        <p style={styles.challengeDescription}>
          Preparando la expedición.
        </p>
      </article>
    </section>
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

function renderHearts(health: number) {
  const safeHealth = Math.max(0, health);
  const visibleSlots = Math.max(DUNGEON_INITIAL_HEALTH, safeHealth);

  return Array.from({ length: visibleSlots }, (_, index) =>
    index < safeHealth ? '♥' : '♡',
  ).join(' ');
}

function getDungeonTimeText(dungeonState: DungeonState): string {
  switch (dungeonState.phase) {
    case 'bettingCountdown':
      return `${dungeonState.bettingCountdown}s apuestas`;

    case 'choosingClass':
      return `${dungeonState.classSelectionCountdown}s clase`;

    case 'drawingCards':
      return isContinuingCurrentRoom(dungeonState)
        ? 'Mismo reto'
        : 'Robando cartas';

    case 'choosingCard':
      return `${dungeonState.cardSelectionCountdown}s carta`;

    case 'resolvingRoom':
      return `${dungeonState.resolveCountdown}s resolver`;

    case 'escaped':
    case 'dead':
    case 'finished':
      return `${dungeonState.resultsCountdown}s menú`;

    default:
      return '-';
  }
}

function getRoomDescription(roomName: string): string {
  const normalizedRoomName = roomName.toLowerCase();

  if (normalizedRoomName.includes('combate')) {
    return 'Si no superas esta sala pierdes 1 punto de vida al final del turno.';
  }

  if (normalizedRoomName.includes('trampa')) {
    return 'Si no superas esta sala pierdes 1 punto de vida al final del turno.';
  }

  if (
    normalizedRoomName.includes('vacía') ||
    normalizedRoomName.includes('vacia')
  ) {
    return 'Esta sala se supera automáticamente. No se puede perder vida aquí.';
  }

  return 'Supera el reto usando una de tus cartas.';
}

function getResultTitle(dungeonState: DungeonState): string {
  if (dungeonState.phase === 'escaped') {
    return 'Has escapado';
  }

  if (dungeonState.phase === 'dead') {
    return 'Has muerto';
  }

  return 'Partida finalizada';
}

function isContinuingCurrentRoom(dungeonState: DungeonState): boolean {
  return Boolean(
    dungeonState.currentRoom &&
      dungeonState.lastTurnResult &&
      !dungeonState.lastTurnResult.roomCleared,
  );
}