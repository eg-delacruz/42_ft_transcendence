export type DungeonClass =
  | 'mague'
  | 'rogue'
  | 'warrior';

export type DungeonRoomType =
  | 'combat'
  | 'trap'
  | 'empty';

export type DungeonPhase =
  | 'bettingCountdown'
  | 'choosingClass'
  | 'drawingCards'
  | 'choosingCard'
  | 'resolvingRoom'
  | 'escaped'
  | 'dead'
  | 'finished';

export type DungeonCardEffect =
  | 'clearCombat'
  | 'clearTrap'
  | 'clearAll'
  | 'preventDamage'
  | 'heal'
  | 'bonusScore'
  | 'selfDamage';

export type DungeonCard = {
  id: string;
  name: string;
  probability: number;
  effects: DungeonCardEffect[];
  icon: string;
};

export type DungeonRoom = {
  type: DungeonRoomType;
  name: string;
  probability: number;
  icon: string;
};

export type DungeonPlayer = {
  class?: DungeonClass;
  health: number;
  score: number;
  streak: number;
  roundsSurvived: number;
};

export type DungeonTurnResult = {
  roomCleared: boolean;
  damageTaken: number;
  healingReceived: number;
  scoreGained: number;
  message: string;
};

export type DungeonState = {
  phase: DungeonPhase;
  bettingCountdown: number;
  classSelectionCountdown: number;
  cardSelectionCountdown: number;
  resolveCountdown: number;
  resultsCountdown: number;
  player: DungeonPlayer;
  currentRoom?: DungeonRoom;
  hand: DungeonCard[];
  lastTurnResult?: DungeonTurnResult;
};

export const DUNGEON_INITIAL_HEALTH = 5;

export const DUNGEON_BETTING_COUNTDOWN_SECONDS = 3;
export const DUNGEON_CLASS_SELECTION_SECONDS = 5;
export const DUNGEON_CARD_SELECTION_SECONDS = 3;
export const DUNGEON_RESOLVE_SECONDS = 1;
export const DUNGEON_RESULTS_COUNTDOWN_SECONDS = 3;

export const DUNGEON_ROOM_SCORE = 5;
export const DUNGEON_STREAK_SCORE = 10;
export const DUNGEON_DEATH_SCORE_PENALTY = 0.25;
export const DUNGEON_HAND_SIZE = 3;

export const DUNGEON_ROOMS: DungeonRoom[] = [
  {
    type: 'combat',
    name: 'Combate',
    probability: 33,
    icon: '⚔️',
  },
  {
    type: 'trap',
    name: 'Trampa',
    probability: 33,
    icon: '🪤',
  },
  {
    type: 'empty',
    name: 'Sala vacía',
    probability: 33,
    icon: '🚪',
  },
];

export const DUNGEON_DECKS: Record<DungeonClass, DungeonCard[]> = {
  mague: [
    {
      id: 'mague-fireball',
      name: 'Bola de fuego',
      probability: 50,
      effects: ['clearCombat'],
      icon: '🔥',
    },
    {
      id: 'mague-magic-shield',
      name: 'Escudo mágico',
      probability: 30,
      effects: ['preventDamage'],
      icon: '🛡️',
    },
    {
      id: 'mague-invisibility',
      name: 'Invisibilidad',
      probability: 20,
      effects: ['clearTrap'],
      icon: '👻',
    },
  ],
  warrior: [
    {
      id: 'warrior-fight',
      name: 'Luchar',
      probability: 50,
      effects: ['clearCombat', 'selfDamage'],
      icon: '🗡️',
    },
    {
      id: 'warrior-block',
      name: 'Bloquear',
      probability: 30,
      effects: ['clearTrap', 'preventDamage'],
      icon: '🛡️',
    },
    {
      id: 'warrior-healing-potion',
      name: 'Poción',
      probability: 20,
      effects: ['heal'],
      icon: '❤️',
    },
  ],
  rogue: [
    {
      id: 'rogue-fight',
      name: 'Luchar',
      probability: 50,
      effects: ['clearCombat', 'selfDamage'],
      icon: '🗡️',
    },
    {
      id: 'rogue-stealth',
      name: 'Sigilo',
      probability: 30,
      effects: ['clearAll'],
      icon: '🥷',
    },
    {
      id: 'rogue-loot',
      name: 'Saquear',
      probability: 20,
      effects: ['clearAll', 'bonusScore'],
      icon: '💰',
    },
  ],
};

export const DUNGEON_CLASS_LABELS: Record<DungeonClass, string> = {
  mague: 'Mague',
  rogue: 'Rogue',
  warrior: 'Warrior',
};

export const DUNGEON_CLASS_ICONS: Record<DungeonClass, string> = {
  mague: '🧙',
  rogue: '🥷',
  warrior: '🛡️',
};

export const DUNGEON_EFFECT_ICONS: Record<DungeonCardEffect, string> = {
  clearCombat: '⚔️',
  clearTrap: '🪤',
  clearAll: '✅',
  preventDamage: '🛡️',
  heal: '❤️',
  bonusScore: '💰',
  selfDamage: '💥',
};

export const DUNGEON_EFFECT_LABELS: Record<DungeonCardEffect, string> = {
  clearCombat: 'Combate',
  clearTrap: 'Trampa',
  clearAll: 'Todo',
  preventDamage: 'Defensa',
  heal: 'Cura',
  bonusScore: 'Bonus',
  selfDamage: 'Daño propio',
};