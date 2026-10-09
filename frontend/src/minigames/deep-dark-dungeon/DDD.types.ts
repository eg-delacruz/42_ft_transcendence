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
};

export type DungeonRoom = {
  type: DungeonRoomType;
  name: string;
  probability: number;
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

/*
 * ============================================================
 * CONFIGURACIÓN GENERAL
 * ============================================================
 */

export const DUNGEON_INITIAL_HEALTH = 5;
export const DUNGEON_BETTING_COUNTDOWN_SECONDS = 5;
export const DUNGEON_CLASS_SELECTION_SECONDS = 20;
export const DUNGEON_CARD_SELECTION_SECONDS = 3;
export const DUNGEON_RESOLVE_SECONDS = 0.2;
export const DUNGEON_RESULTS_COUNTDOWN_SECONDS = 2;
export const DUNGEON_ROOM_SCORE = 5;
export const DUNGEON_STREAK_SCORE = 10;
export const DUNGEON_DEATH_SCORE_PENALTY = 0.25;
export const DUNGEON_HAND_SIZE = 3;

/*
 * ============================================================
 * SALAS
 * ============================================================
 *
 * Internamente mantenemos:
 *
 * combat -> Combate
 * trap   -> Trampa
 * empty  -> Pasillo
 *
 * No cambiamos los identificadores internos porque DDD.logic.ts
 * utiliza estos valores para resolver las salas.
 */

export const DUNGEON_ROOMS: DungeonRoom[] = [
  {
    type: 'combat',
    name: 'ddd.roomType.combat',
    probability: 40,
  },
  {
    type: 'trap',
    name: 'ddd.roomType.trap',
    probability: 40,
  },
  {
    type: 'empty',
    name: 'ddd.roomType.empty',
    probability: 20,
  },
];

/*
 * ============================================================
 * IMÁGENES DE LAS SALAS
 * ============================================================
 *
 * Cada tipo de sala tiene disponibles estas imágenes.
 * La elección aleatoria de una variante la haremos al mostrar
 * la sala.
 */

export const DUNGEON_ROOM_IMAGES: Record<
  DungeonRoomType,
  string[]
> = {
  combat: [
    'Combate1.png',
    'Combate2.png',
    'Combate3.png',
  ],

  trap: [
    'Trampa1.png',
    'Trampa2.png',
    'Trampa3.png',
  ],

  empty: [
    'Pasillo1.png',
  ],
};

/*
 * ============================================================
 * MAZOS
 * ============================================================
 *
 * Los efectos y probabilidades siguen siendo exactamente los
 * que utiliza la lógica del juego.
 *
 * Eliminamos los iconos porque la representación visual se hará
 * mediante los PNG diseñados.
 */

export const DUNGEON_DECKS: Record<
  DungeonClass,
  DungeonCard[]
> = {
  mague: [
    {
      id: 'mague-fireball',
      name: 'ddd.cards.mague-fireball',
      probability: 50,
      effects: ['clearCombat'],
    },
    {
      id: 'mague-magic-shield',
      name: 'ddd.cards.mague-magic-shield',
      probability: 30,
      effects: ['preventDamage'],
    },
    {
      id: 'mague-invisibility',
      name: 'ddd.cards.mague-invisibility',
      probability: 20,
      effects: ['clearTrap'],
    },
  ],

  warrior: [
    {
      id: 'warrior-fight',
      name: 'ddd.cards.warrior-fight',
      probability: 60,
      effects: ['clearCombat', 'selfDamage'],
    },
    {
      id: 'warrior-block',
      name: 'ddd.cards.warrior-block',
      probability: 30,
      effects: ['clearTrap', 'preventDamage'],
    },
    {
      id: 'warrior-healing-potion',
      name: 'ddd.cards.warrior-healing-potion',
      probability: 10,
      effects: ['heal'],
    },
  ],

  rogue: [
    {
      id: 'rogue-fight',
      name: 'ddd.cards.rogue-fight',
      probability: 60,
      effects: ['clearCombat', 'selfDamage'],
    },
    {
      id: 'rogue-stealth',
      name: 'ddd.cards.rogue-stealth',
      probability: 30,
      effects: ['clearAll'],
    },
    {
      id: 'rogue-loot',
      name: 'ddd.cards.rogue-loot',
      probability: 10,
      effects: ['clearAll', 'bonusScore'],
    },
  ],
};

/*
 * ============================================================
 * IMÁGENES DE LAS CARTAS
 * ============================================================
 *
 * Relacionamos cada ID interno de carta con el PNG que deberá
 * utilizar DeepDarkDungeon.tsx.
 */

export const DUNGEON_CARD_IMAGES: Record<
  string,
  string
> = {
  /*
   * Mague
   */

  'mague-fireball': 'Mague1.png',
  'mague-magic-shield': 'Mague2.png',
  'mague-invisibility': 'Mague3.png',

  /*
   * Warrior
   */

  'warrior-fight': 'Guerrero1.png',
  'warrior-block': 'Guerrero2.png',
  'warrior-healing-potion': 'Guerrero3.png',

  /*
   * Rogue
   */

  'rogue-fight': 'Rogue1.png',
  'rogue-stealth': 'Rogue2.png',
  'rogue-loot': 'Rogue3.png',
};

/*
 * ============================================================
 * CLASES
 * ============================================================
 */

export const DUNGEON_CLASS_LABELS: Record<
  DungeonClass,
  string
> = {
  mague: 'ddd.class.mague',
  rogue: 'ddd.class.rogue',
  warrior: 'ddd.class.warrior',
};

export const DUNGEON_CLASS_ICONS: Record<
  DungeonClass,
  string
> = {
  mague: '🧙',
  rogue: '🥷',
  warrior: '🛡️',
};

export const DUNGEON_CLASS_CONTROL_LABELS: Record<
  DungeonClass,
  string
> = {
  mague: '←',
  warrior: '↑',
  rogue: '→',
};

/*
 * ============================================================
 * EFECTOS
 * ============================================================
 *
 * Los mantenemos porque forman parte de la lógica del juego,
 * aunque ya no se mostrarán debajo de las cartas.
 */

export const DUNGEON_EFFECT_ICONS: Record<
  DungeonCardEffect,
  string
> = {
  clearCombat: '⚔️',
  clearTrap: '🪤',
  clearAll: '✅',
  preventDamage: '🛡️',
  heal: '❤️',
  bonusScore: '💰',
  selfDamage: '💥',
};

export const DUNGEON_EFFECT_LABELS: Record<
  DungeonCardEffect,
  string
> = {
  clearCombat: 'ddd.effect.clearCombat',
  clearTrap: 'ddd.effect.cleartTrap',
  clearAll: 'ddd.effect.clearAll',
  preventDamage: 'ddd.effect.preventDamage',
  heal: 'ddd.effect.heal',
  bonusScore: 'ddd.effect.bonusScore',
  selfDamage: 'ddd.effect.selfDamage',
};

/*
 * ============================================================
 * CONTROLES
 * ============================================================
 */

export const DUNGEON_CLASS_CONTROL_TEXT =
  'ddd.controls.classes';

export const DUNGEON_CARD_CONTROL_TEXT =
  'ddd.controls.cards';

export const DUNGEON_CARD_1_LABEL = 'ddd.control.card1';

export const DUNGEON_CARD_2_LABEL = 'ddd.control.card2';

export const DUNGEON_CARD_3_LABEL = 'ddd.control.card3';