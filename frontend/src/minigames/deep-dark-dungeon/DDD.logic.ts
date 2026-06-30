import {
  DUNGEON_BETTING_COUNTDOWN_SECONDS,
  DUNGEON_CARD_1_LABEL,
  DUNGEON_CARD_2_LABEL,
  DUNGEON_CARD_3_LABEL,
  DUNGEON_CARD_SELECTION_SECONDS,
  DUNGEON_CLASS_SELECTION_SECONDS,
  DUNGEON_DEATH_SCORE_PENALTY,
  DUNGEON_DECKS,
  DUNGEON_HAND_SIZE,
  DUNGEON_INITIAL_HEALTH,
  DUNGEON_RESOLVE_SECONDS,
  DUNGEON_RESULTS_COUNTDOWN_SECONDS,
  DUNGEON_ROOMS,
  DUNGEON_ROOM_SCORE,
  type DungeonCard,
  type DungeonClass,
  type DungeonPlayer,
  type DungeonRoom,
  type DungeonState,
  type DungeonTurnResult,
} from './DDD.types';

export function createInitialDungeonState(): DungeonState {
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

export function handleDungeonKey(
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

export function chooseClass(
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

export function prepareNextDungeonStep(state: DungeonState): DungeonState {
  if (state.phase !== 'drawingCards') {
    return state;
  }

  if (shouldContinueCurrentRoom(state)) {
    return continueCurrentRoom(state);
  }

  return startNewRoom(state);
}

export function continueCurrentRoom(state: DungeonState): DungeonState {
  if (!state.player.class || !state.currentRoom) {
    return startNewRoom(state);
  }

  return {
    ...state,
    phase: 'choosingCard',
    currentRoom: state.currentRoom,
    hand: drawCards(state.player.class, DUNGEON_HAND_SIZE),
    cardSelectionCountdown: DUNGEON_CARD_SELECTION_SECONDS,
    resolveCountdown: DUNGEON_RESOLVE_SECONDS,
    lastTurnResult: undefined,
  };
}

function shouldContinueCurrentRoom(state: DungeonState): boolean {
  return Boolean(
    state.currentRoom &&
      state.lastTurnResult &&
      !state.lastTurnResult.roomCleared,
  );
}

export function startNewRoom(state: DungeonState): DungeonState {
  if (!state.player.class) {
    return chooseClass(state, 'warrior');
  }

  return {
    ...state,
    phase: 'choosingCard',
    currentRoom: drawRoom(),
    hand: drawCards(state.player.class, DUNGEON_HAND_SIZE),
    cardSelectionCountdown: DUNGEON_CARD_SELECTION_SECONDS,
    resolveCountdown: DUNGEON_RESOLVE_SECONDS,
    lastTurnResult: undefined,
  };
}

export function resolveCardChoice(
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

export function resolveTurn(
  player: DungeonPlayer,
  room: DungeonRoom,
  card: DungeonCard,
): DungeonTurnResult {
  if (room.type === 'empty') {
    const scoreGained = getRoomScore(player.streak) + getBonusScore(card);

    return {
      roomCleared: true,
      damageTaken: 0,
      healingReceived: getHealing(card),
      scoreGained,
      message: `🚪 Sala vacía. ${card.icon} ${card.name}. Sala superada. +${scoreGained}`,
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

export function buildTurnMessage(
  room: DungeonRoom,
  card: DungeonCard,
  roomCleared: boolean,
  damageTaken: number,
  healingReceived: number,
  scoreGained: number,
): string {
  const resultText = roomCleared ? 'Superada' : 'No superada';
  const continueText = roomCleared ? 'Avanzas' : 'El reto continúa';

  return `${room.icon} ${room.name} | ${card.icon} ${card.name} | ${resultText} | Daño ${damageTaken} | Cura ${healingReceived} | +${scoreGained} | ${continueText}`;
}

export function escapeDungeon(state: DungeonState): DungeonState {
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

export function finishAsDead(state: DungeonState): DungeonState {
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

export function drawRoom(): DungeonRoom {
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

export function drawCards(
  dungeonClass: DungeonClass,
  amount: number,
): DungeonCard[] {
  return Array.from({ length: amount }, () => drawCard(dungeonClass));
}

export function drawCard(dungeonClass: DungeonClass): DungeonCard {
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

export function getRoomScore(currentStreak: number): number {
  const nextStreak = currentStreak + 1;

  return DUNGEON_ROOM_SCORE * nextStreak;
}

export function getBonusScore(card: DungeonCard): number {
  return card.effects.includes('bonusScore') ? 5 : 0;
}

export function getSelfDamage(card: DungeonCard): number {
  return card.effects.includes('selfDamage') ? 1 : 0;
}

export function getHealing(card: DungeonCard): number {
  return card.effects.includes('heal') ? 4 : 0;
}

export function getVisualCardSlots(hand: DungeonCard[]) {
  return [
    {
      card: hand[0],
      originalIndex: 0,
      label: DUNGEON_CARD_1_LABEL,
    },
    {
      card: hand[2],
      originalIndex: 2,
      label: DUNGEON_CARD_3_LABEL,
    },
    {
      card: hand[1],
      originalIndex: 1,
      label: DUNGEON_CARD_2_LABEL,
    },
  ].filter((slot) => slot.card);
}