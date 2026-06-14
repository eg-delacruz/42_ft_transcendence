import { useEffect, useState } from 'react';

import {
  DUNGEON_BETTING_COUNTDOWN_SECONDS,
  DUNGEON_CARD_SELECTION_SECONDS,
  DUNGEON_CLASS_ICONS,
  DUNGEON_CLASS_LABELS,
  DUNGEON_CLASS_SELECTION_SECONDS,
  DUNGEON_DEATH_SCORE_PENALTY,
  DUNGEON_DECKS,
  DUNGEON_EFFECT_ICONS,
  DUNGEON_EFFECT_LABELS,
  DUNGEON_HAND_SIZE,
  DUNGEON_INITIAL_HEALTH,
  DUNGEON_RESOLVE_SECONDS,
  DUNGEON_RESULTS_COUNTDOWN_SECONDS,
  DUNGEON_ROOM_SCORE,
  DUNGEON_ROOMS,
  DUNGEON_STREAK_SCORE,
  type DungeonCard,
  type DungeonClass,
  type DungeonPlayer,
  type DungeonRoom,
  type DungeonState,
  type DungeonTurnResult,
} from './dungeonTypes';

type DeepDarkDungeonProps = {
  onExitToMenu?: () => void;
};

function createInitialDungeonState(): DungeonState {
  return {
    phase: 'bettingCountdown',
    bettingCountdown: DUNGEON_BETTING_COUNTDOWN_SECONDS,
    classSelectionCountdown: DUNGEON_CLASS_SELECTION_SECONDS,
    cardSelectionCountdown: DUNGEON_CARD_SELECTION_SECONDS,
    resolveCountdown: DUNGEON_RESOLVE_SECONDS,
    resultsCountdown: DUNGEON_RESULTS_COUNTDOWN_SECONDS,
    player: {
      class: undefined,
      health: DUNGEON_INITIAL_HEALTH,
      score: 0,
      streak: 0,
      roundsSurvived: 0,
    },
    currentRoom: undefined,
    hand: [],
    lastTurnResult: undefined,
  };
}

export function DeepDarkDungeon({ onExitToMenu }: DeepDarkDungeonProps) {
  const [dungeonState, setDungeonState] = useState<DungeonState>(
    createInitialDungeonState,
  );

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
                <article style={styles.classCard}>
                  <p style={styles.classKey}>←</p>
                  <p style={styles.classIcon}>{DUNGEON_CLASS_ICONS.mague}</p>
                  <p style={styles.className}>{DUNGEON_CLASS_LABELS.mague}</p>
                </article>

                <article style={styles.classCard}>
                  <p style={styles.classKey}>↑</p>
                  <p style={styles.classIcon}>{DUNGEON_CLASS_ICONS.warrior}</p>
                  <p style={styles.className}>{DUNGEON_CLASS_LABELS.warrior}</p>
                </article>

                <article style={styles.classCard}>
                  <p style={styles.classKey}>→</p>
                  <p style={styles.classIcon}>{DUNGEON_CLASS_ICONS.rogue}</p>
                  <p style={styles.className}>{DUNGEON_CLASS_LABELS.rogue}</p>
                </article>
              </section>

              <p style={styles.text}>← Mague | ↑ Warrior | → Rogue</p>
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
              <p style={styles.text}>
                ← Carta 1 | ↑ Carta 3 | → Carta 2 | ↓ Abandonar
              </p>
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

function handleDungeonKey(
  state: DungeonState,
  code: string,
): DungeonState | null {
  if (state.phase === 'choosingClass') {
    if (code === 'ArrowLeft') {
      return chooseClass(state, 'mague');
    }

    if (code === 'ArrowRight') {
      return chooseClass(state, 'rogue');
    }

    if (code === 'ArrowUp') {
      return chooseClass(state, 'warrior');
    }

    return null;
  }

  if (state.phase === 'choosingCard') {
    if (code === 'ArrowLeft') {
      return resolveCardChoice(state, 0);
    }

    if (code === 'ArrowRight') {
      return resolveCardChoice(state, 1);
    }

    if (code === 'ArrowUp') {
      return resolveCardChoice(state, 2);
    }

    if (code === 'ArrowDown') {
      return escapeDungeon(state);
    }

    return null;
  }

  return null;
}

function chooseClass(
  state: DungeonState,
  dungeonClass: DungeonClass,
): DungeonState {
  return {
    ...state,
    phase: 'drawingCards',
    player: {
      ...state.player,
      class: dungeonClass,
    },
  };
}

function startNewRoom(state: DungeonState): DungeonState {
  if (!state.player.class) {
    return chooseClass(state, 'warrior');
  }

  return {
    ...state,
    phase: 'choosingCard',
    currentRoom: drawRoom(),
    hand: drawCards(state.player.class, DUNGEON_HAND_SIZE),
    cardSelectionCountdown: DUNGEON_CARD_SELECTION_SECONDS,
    lastTurnResult: undefined,
  };
}

function resolveCardChoice(
  state: DungeonState,
  cardIndex: number,
): DungeonState {
  if (
    state.phase !== 'choosingCard' ||
    !state.currentRoom ||
    !state.player.class
  ) {
    return state;
  }

  const selectedCard = state.hand[cardIndex] ?? state.hand[0];

  const turnResult = resolveTurn(
    state.player,
    state.currentRoom,
    selectedCard,
  );

  const nextScore = state.player.score + turnResult.scoreGained;

  const nextHealth = Math.max(
    Math.min(
      state.player.health - turnResult.damageTaken + turnResult.healingReceived,
      DUNGEON_INITIAL_HEALTH,
    ),
    0,
  );

  return {
    ...state,
    phase: 'resolvingRoom',
    resolveCountdown: DUNGEON_RESOLVE_SECONDS,
    player: {
      ...state.player,
      health: nextHealth,
      score: nextScore,
      streak: turnResult.roomCleared ? state.player.streak + 1 : 0,
      roundsSurvived: turnResult.roomCleared
        ? state.player.roundsSurvived + 1
        : state.player.roundsSurvived,
    },
    lastTurnResult: turnResult,
  };
}

function resolveTurn(
  player: DungeonPlayer,
  room: DungeonRoom,
  card: DungeonCard,
): DungeonTurnResult {
  if (room.type === 'empty') {
    const scoreGained = getRoomScore(player.streak) + getBonusScore(card);

    return {
      roomCleared: true,
      damageTaken: getSelfDamage(card),
      healingReceived: getHealing(card),
      scoreGained,
      message: `🚪 Sala vacía. ${card.icon} ${card.name}. Sala superada.`,
    };
  }

  const roomCleared =
    card.effects.includes('clearAll') ||
    (room.type === 'combat' && card.effects.includes('clearCombat')) ||
    (room.type === 'trap' && card.effects.includes('clearTrap'));

  const preventedDamage = card.effects.includes('preventDamage');

  const baseDamage = roomCleared || preventedDamage ? 0 : 1;
  const damageTaken = baseDamage + getSelfDamage(card);
  const healingReceived = getHealing(card);

  const scoreGained = roomCleared
    ? getRoomScore(player.streak) + getBonusScore(card)
    : getBonusScore(card);

  return {
    roomCleared,
    damageTaken,
    healingReceived,
    scoreGained,
    message: buildTurnMessage(
      room,
      card,
      roomCleared,
      damageTaken,
      healingReceived,
      scoreGained,
    ),
  };
}

function buildTurnMessage(
  room: DungeonRoom,
  card: DungeonCard,
  roomCleared: boolean,
  damageTaken: number,
  healingReceived: number,
  scoreGained: number,
): string {
  const resultText = roomCleared ? 'Superada' : 'Fallida';

  return `${room.icon} ${room.name} | ${card.icon} ${card.name} | ${resultText} | Daño ${damageTaken} | Cura ${healingReceived} | +${scoreGained}`;
}

function escapeDungeon(state: DungeonState): DungeonState {
  return {
    ...state,
    phase: 'escaped',
    resultsCountdown: DUNGEON_RESULTS_COUNTDOWN_SECONDS,
    lastTurnResult: {
      roomCleared: false,
      damageTaken: 0,
      healingReceived: 0,
      scoreGained: 0,
      message: '🏃 Has abandonado la mazmorra con vida.',
    },
  };
}

function finishAsDead(state: DungeonState): DungeonState {
  const penalizedScore = Math.floor(
    state.player.score * (1 - DUNGEON_DEATH_SCORE_PENALTY),
  );

  return {
    ...state,
    phase: 'dead',
    resultsCountdown: DUNGEON_RESULTS_COUNTDOWN_SECONDS,
    player: {
      ...state.player,
      score: penalizedScore,
    },
    lastTurnResult: {
      roomCleared: false,
      damageTaken: 0,
      healingReceived: 0,
      scoreGained: 0,
      message: '☠️ Has muerto. Pierdes el 25% del score acumulado.',
    },
  };
}

function drawRoom(): DungeonRoom {
  const randomValue = Math.random() * 100;
  let cumulative = 0;

  for (const room of DUNGEON_ROOMS) {
    cumulative += room.probability;

    if (randomValue < cumulative) {
      return room;
    }
  }

  return DUNGEON_ROOMS[DUNGEON_ROOMS.length - 1];
}

function drawCards(dungeonClass: DungeonClass, amount: number): DungeonCard[] {
  return Array.from({ length: amount }, () => drawCard(dungeonClass));
}

function drawCard(dungeonClass: DungeonClass): DungeonCard {
  const deck = DUNGEON_DECKS[dungeonClass];
  const randomValue = Math.random() * 100;
  let cumulative = 0;

  for (const card of deck) {
    cumulative += card.probability;

    if (randomValue < cumulative) {
      return card;
    }
  }

  return deck[deck.length - 1];
}

function getRoomScore(currentStreak: number): number {
  if (currentStreak > 0) {
    return DUNGEON_STREAK_SCORE;
  }

  return DUNGEON_ROOM_SCORE;
}

function getBonusScore(card: DungeonCard): number {
  return card.effects.includes('bonusScore') ? 5 : 0;
}

function getSelfDamage(card: DungeonCard): number {
  return card.effects.includes('selfDamage') ? 1 : 0;
}

function getHealing(card: DungeonCard): number {
  return card.effects.includes('heal') ? 4 : 0;
}

function getVisualCardSlots(hand: DungeonCard[]) {
  return [
    {
      card: hand[0],
      originalIndex: 0,
      label: '← Carta 1',
    },
    {
      card: hand[2],
      originalIndex: 2,
      label: '↑ Carta 3',
    },
    {
      card: hand[1],
      originalIndex: 1,
      label: '→ Carta 2',
    },
  ].filter((slot) => slot.card);
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
    gap: '18px',
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
    fontSize: '44px',
  },
  subtitle: {
    margin: 0,
    color: '#d4d4d8',
  },
  statusBox: {
    minHeight: '160px',
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  phaseTitle: {
    margin: 0,
    fontSize: '28px',
  },
  bigNumber: {
    margin: 0,
    fontSize: '56px',
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
  sectionTitle: {
    margin: '0 0 8px',
    fontSize: '22px',
  },
  classOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    width: '100%',
    maxWidth: '520px',
  },
  classCard: {
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    background: '#101018',
    padding: '12px',
    textAlign: 'center',
  },
  classKey: {
    margin: 0,
    color: '#a1a1aa',
    fontSize: '16px',
  },
  classIcon: {
    margin: '6px 0',
    fontSize: '36px',
  },
  className: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
  },
  playerBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
  },
  roomBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    textAlign: 'center',
  },
  roomIcon: {
    margin: 0,
    fontSize: '56px',
  },
  roomName: {
    margin: '8px 0 0',
    fontSize: '30px',
    fontWeight: 700,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
  },
  card: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    minHeight: '140px',
    textAlign: 'center',
  },
  cardKey: {
    margin: 0,
    color: '#a1a1aa',
    fontSize: '14px',
  },
  cardIcon: {
    margin: '8px 0',
    fontSize: '56px',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
  },
  effectIcons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '28px',
    marginTop: '12px',
  },
  resultBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    textAlign: 'center',
  },
};