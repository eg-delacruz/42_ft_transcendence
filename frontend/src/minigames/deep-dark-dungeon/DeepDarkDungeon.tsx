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
  DUNGEON_INITIAL_HEALTH,
  DUNGEON_RESOLVE_SECONDS,
  type DungeonCard,
  type DungeonClass,
  type DungeonRoomType,
  type DungeonState,
} from './DDD.types';

import { getDungeonUserId } from './DDD.users';

/*
 * ============================================================
 * IMÁGENES DEL TUTORIAL
 * ============================================================
 */

import tutorialSuccessImage from './Resources/1.png';
import tutorialDamageImage from './Resources/2.png';
import tutorialProtectionImage from './Resources/3.png';

/*
 * ============================================================
 * IMÁGENES DE RETOS
 * ============================================================
 */

import combat1Image from './Resources/Combate1.png';
import combat2Image from './Resources/Combate2.png';
import combat3Image from './Resources/Combate3.png';

import trap1Image from './Resources/Trampa1.png';
import trap2Image from './Resources/Trampa2.png';
import trap3Image from './Resources/Trampa3.png';

import hallway1Image from './Resources/Pasillo1.png';
import dungeonBackground from './Resources/Fondo.jpg';
import monedasImage from './Resources/Monedas.png';

/*
 * ============================================================
 * IMÁGENES DE CARTAS
 * ============================================================
 */

import warrior1Image from './Resources/Guerrero1.png';
import warrior2Image from './Resources/Guerrero2.png';
import warrior3Image from './Resources/Guerrero3.png';

import rogue1Image from './Resources/Rogue1.png';
import rogue2Image from './Resources/Rogue2.png';
import rogue3Image from './Resources/Rogue3.png';

import magueClassImage from './Resources/Mague.png';
import warriorClassImage from './Resources/Guerrero.png';
import rogueClassImage from './Resources/Rogue.png';
import mague1Image from './Resources/Mague1.png';
import mague2Image from './Resources/Mague2.png';
import mague3Image from './Resources/Mague3.png';

type DeepDarkDungeonProps = {
  onExitToMenu?: () => void;
};

/*
 * ============================================================
 * ASOCIACIÓN DE CARTAS CON SUS PNG
 * ============================================================
 */

const CARD_IMAGES: Record<string, string> = {
  'warrior-fight': warrior1Image,
  'warrior-block': warrior2Image,
  'warrior-healing-potion': warrior3Image,

  'rogue-fight': rogue1Image,
  'rogue-stealth': rogue2Image,
  'rogue-loot': rogue3Image,

  'mague-fireball': mague1Image,
  'mague-magic-shield': mague2Image,
  'mague-invisibility': mague3Image,
};

/*
 * ============================================================
 * VARIANTES VISUALES DE LOS RETOS
 * ============================================================
 */

const ROOM_IMAGES: Record<DungeonRoomType, string[]> = {
  combat: [
    combat1Image,
    combat2Image,
    combat3Image,
  ],

  trap: [
    trap1Image,
    trap2Image,
    trap3Image,
  ],

  empty: [
    hallway1Image,
  ],
};

export function DeepDarkDungeon({
  onExitToMenu,
}: DeepDarkDungeonProps) {
  const [dungeonState, setDungeonState] = useState<DungeonState>(
    createInitialDungeonState,
  );

  const hasSubmittedScore = useRef(false);

  /*
   * ============================================================
   * CUENTA ATRÁS INICIAL
   * ============================================================
   */

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
            classSelectionCountdown:
              DUNGEON_CLASS_SELECTION_SECONDS,
          };
        }

        return {
          ...currentState,
          bettingCountdown:
            currentState.bettingCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    dungeonState.phase,
    dungeonState.bettingCountdown,
  ]);

  /*
   * ============================================================
   * SELECCIÓN DE CLASE
   * ============================================================
   */

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
          classSelectionCountdown:
            currentState.classSelectionCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    dungeonState.phase,
    dungeonState.classSelectionCountdown,
  ]);

  /*
   * ============================================================
   * ROBAR CARTAS
   * ============================================================
   */

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

  /*
   * ============================================================
   * SELECCIÓN DE CARTA
   * ============================================================
   */

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
          cardSelectionCountdown:
            currentState.cardSelectionCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    dungeonState.phase,
    dungeonState.cardSelectionCountdown,
  ]);

  /*
   * ============================================================
   * RESOLUCIÓN DE SALA
   * ============================================================
   */

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
          resolveCountdown:
            currentState.resolveCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    dungeonState.phase,
    dungeonState.resolveCountdown,
  ]);

  /*
   * ============================================================
   * SCORE
   * ============================================================
   */

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
      console.error(
        'Error updating Deep & Dark Dungeon top score:',
        error,
      );
    });
  }, [
    dungeonState.phase,
    dungeonState.player.score,
  ]);

  /*
   * ============================================================
   * CUENTA ATRÁS DE RESULTADOS
   * ============================================================
   */

  useEffect(() => {
    const shouldCountResults =
      dungeonState.phase === 'escaped' ||
      dungeonState.phase === 'dead' ||
      dungeonState.phase === 'finished';

    if (
      !shouldCountResults ||
      dungeonState.resultsCountdown <= 0
    ) {
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
          resultsCountdown:
            currentState.resultsCountdown - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    dungeonState.phase,
    dungeonState.resultsCountdown,
  ]);

  /*
   * ============================================================
   * SALIDA AL MENÚ
   * ============================================================
   */

  useEffect(() => {
    const shouldExit =
      (dungeonState.phase === 'escaped' ||
        dungeonState.phase === 'dead' ||
        dungeonState.phase === 'finished') &&
      dungeonState.resultsCountdown <= 0;

    if (shouldExit) {
      onExitToMenu?.();
    }
  }, [
    dungeonState.phase,
    dungeonState.resultsCountdown,
    onExitToMenu,
  ]);

  /*
   * ============================================================
   * CONTROLES
   * ============================================================
   */

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

      const nextState = handleDungeonKey(
        dungeonState,
        event.code,
      );

      if (!nextState) {
        return;
      }

      event.preventDefault();
      setDungeonState(nextState);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [dungeonState]);

  const shouldShowClassSelection =
    dungeonState.phase === 'choosingClass';

  const shouldShowHand =
    dungeonState.phase === 'choosingCard' ||
    dungeonState.phase === 'resolvingRoom';

  return (
    <main style={styles.page}>
      <TopScores minigameId="deep-dark-dungeon" />

      <section
        style={{
          ...styles.board,
          backgroundImage: `url(${dungeonBackground})`,
        }}
      >
        <header style={styles.header}>
          <p style={styles.kicker}>Minigame</p>

          <h1 style={styles.title}>
            Deep & Dark Dungeon
          </h1>

          <p style={styles.subtitle}>
            Elige clase, supera salas y escapa antes de morir.
          </p>
        </header>

        <section style={styles.topGameArea}>
          <PlayerHud dungeonState={dungeonState} />

          <ActiveChallenge
            dungeonState={dungeonState}
          />
        </section>

        <section style={styles.bottomGameArea}>
          {dungeonState.phase ===
            'bettingCountdown' && (
            <DungeonTutorial />
          )}

          {shouldShowClassSelection && (
            <section style={styles.classSelectionArea}>
              <p style={styles.handSideLabel}>
                Clases disponibles
              </p>

              <section style={styles.classOptions}>
                <ClassOption dungeonClass="mague" />
                <ClassOption dungeonClass="warrior" />
                <ClassOption dungeonClass="rogue" />
              </section>

              <p style={styles.controlsHint}>
                {DUNGEON_CLASS_CONTROL_TEXT}
              </p>

              <p style={styles.text}>
                Si no eliges, se seleccionará Warrior.
              </p>
            </section>
          )}

          {dungeonState.phase === 'drawingCards' && (
            <section style={styles.bottomMessageBox}>
              <h2 style={styles.phaseTitle}>
                Robando cartas...
              </h2>

              <p style={styles.text}>
                {isContinuingCurrentRoom(dungeonState)
                  ? 'El reto continúa. Robando nuevas cartas para intentarlo de nuevo.'
                  : 'Preparando la siguiente sala.'}
              </p>
            </section>
          )}

          {shouldShowHand && (
            <section style={styles.handArea}>
              <section style={styles.cards}>
                {getVisualCardSlots(
                  dungeonState.hand,
                ).map(
                  ({
                    card,
                    originalIndex,
                  }) => (
                    <DungeonCardImage
                      key={`${card.id}-${originalIndex}`}
                      card={card}
                    />
                  ),
                )}
              </section>

              <p style={styles.controlsHint}>
                {DUNGEON_CARD_CONTROL_TEXT}
              </p>
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
                Volviendo al menú en{' '}
                {dungeonState.resultsCountdown}...
              </p>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

/*
 * ============================================================
 * CARTA VISUAL
 * ============================================================
 */

function DungeonCardImage({
  card,
}: {
  card: DungeonCard;
}) {
  const image = CARD_IMAGES[card.id];

  if (!image) {
    return null;
  }

  return (
    <article style={styles.gameCard}>
      <img
        src={image}
        alt={card.name}
        style={styles.gameCardImage}
      />
    </article>
  );
}

/*
 * ============================================================
 * TUTORIAL VISUAL
 * ============================================================
 */

function DungeonTutorial() {
  return (
    <section style={styles.tutorialArea}>
      <div style={styles.tutorialGrid}>
        <article style={styles.tutorialCard}>
          <h3 style={styles.tutorialTitle}>
            Supera el reto
          </h3>

          <p style={styles.tutorialText}>
            Elige una clase para determinar tu mazo. Si
            utilizas una carta capaz de superar el reto,
            completarás la sala y ganarás puntos
          </p>

          <img
            src={tutorialSuccessImage}
            alt="Carta que supera un reto"
            style={styles.tutorialImage}
          />
        </article>

        <article style={styles.tutorialCard}>
          <h3 style={styles.tutorialTitle}>
            Cuidado con tu vida
          </h3>

          <p style={styles.tutorialText}>
            Si tu carta no supera el reto, perderás 1 de
            vida. Algunas cartas también pueden hacerte
            daño, así que puedes perder hasta 2 puntos de
            vida
          </p>

          <img
            src={tutorialDamageImage}
            alt="Carta que no supera el reto y provoca pérdida de vida"
            style={styles.tutorialImage}
          />
        </article>

        <article style={styles.tutorialCard}>
          <h3 style={styles.tutorialTitle}>
            Previene el daño
          </h3>

          <p style={styles.tutorialText}>
            Algunas cartas previenen el daño de la ronda.
            No perderás vida, pero tampoco recibirás los
            puntos de superar el reto
          </p>

          <img
            src={tutorialProtectionImage}
            alt="Carta que previene el daño"
            style={styles.tutorialImage}
          />
        </article>
      </div>

      <div style={styles.tutorialEscape}>
        <p style={styles.tutorialText}>
          <strong>Escapa a tiempo.</strong> Puedes retirarte
          cuando quieras para conservar todos tus puntos. Si
          tu vida llega a 0, perderás parte de la puntuación
          acumulada
        </p>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * HUD DEL JUGADOR
 * ============================================================
 */

function PlayerHud({
  dungeonState,
}: {
  dungeonState: DungeonState;
}) {
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
        <span style={styles.hudLabel}>Puntos:</span>

        <span style={styles.scoreWithCoins}>
          <span style={styles.hudValue}>
            {dungeonState.player.score}
          </span>

          <img
            src={monedasImage}
            alt=""
            style={styles.coinIcon}
          />
        </span>
      </div>

      <HudRow
        label="Racha"
        value={`${dungeonState.player.streak} ${
          dungeonState.player.streak > 0 ? '🔥' : ''
        }`}
      />

      <HudRow
        label="Tiempo"
        value={getDungeonTimeText(dungeonState)}
      />

      <HudRow
        label="Salas"
        value={String(
          dungeonState.player.roundsSurvived,
        )}
      />

      <div style={styles.hudRow}>
        <span style={styles.hudLabel}>Vida:</span>

        <span style={styles.hearts}>
          {renderHearts(
            dungeonState.player.health,
          )}
        </span>
      </div>
    </aside>
  );
}

function HudRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.hudRow}>
      <span style={styles.hudLabel}>
        {label}:
      </span>

      <span style={styles.hudValue}>
        {value}
      </span>
    </div>
  );
}

/*
 * ============================================================
 * RETO ACTIVO
 * ============================================================
 */

function ActiveChallenge({
  dungeonState,
}: {
  dungeonState: DungeonState;
}) {
  /*
   * La variante visual se conserva mientras el tipo de
   * habitación no cambie.
   */

  const roomType =
    dungeonState.currentRoom?.type;

  const [roomImage, setRoomImage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!roomType) {
      setRoomImage(null);
      return;
    }

    setRoomImage(
      getRandomRoomImage(roomType),
    );
  }, [roomType]);

  if (
    dungeonState.phase === 'bettingCountdown'
  ) {
    return (
      <section style={styles.challengeArea}>
        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>
            Prepárate para la mazmorra
          </h2>

          <p style={styles.bigNumber}>
            {dungeonState.bettingCountdown}
          </p>

          <p style={styles.challengeDescription}>

          </p>
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'choosingClass') {
    return (
      <section style={styles.challengeArea}>
        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>
            Elige clase
          </h2>

          <p style={styles.bigNumber}>
            {dungeonState.classSelectionCountdown}
          </p>

          <p style={styles.challengeDescription}>
            
          </p>
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'drawingCards') {
    const shouldContinueRoom =
      isContinuingCurrentRoom(dungeonState);

    return (
      <section style={styles.challengeArea}>
        <article style={styles.challengeCard}>
          {shouldContinueRoom &&
          dungeonState.currentRoom &&
          roomImage ? (
            <img
              src={roomImage}
              alt={dungeonState.currentRoom.name}
              style={styles.roomImage}
            />
          ) : (
            <>
              <h2 style={styles.challengeTitle}>
                Nueva sala
              </h2>

              <p style={styles.challengeDescription}>
                Robando cartas y preparando el siguiente
                reto.
              </p>
            </>
          )}
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
        <article style={styles.challengeCard}>
          {roomImage && (
            <img
              src={roomImage}
              alt={dungeonState.currentRoom.name}
              style={styles.roomImage}
            />
          )}

          {dungeonState.phase ===
            'choosingCard' && (
            <p style={styles.challengeTimer}>
              {
                dungeonState.cardSelectionCountdown
              }
              s para elegir carta
            </p>
          )}

          {dungeonState.phase ===
            'resolvingRoom' && (
            <>
              <p style={styles.challengeTimer}>
                {dungeonState.resolveCountdown}s
                resolviendo
              </p>

              {dungeonState.lastTurnResult && (
                <p style={styles.resultText}>
                  {
                    dungeonState.lastTurnResult
                      .message
                  }
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
        <article style={styles.challengeCard}>
          <h2 style={styles.challengeTitle}>
            {getResultTitle(dungeonState)}
          </h2>

          <p style={styles.challengeDescription}>
            Score final: {dungeonState.player.score}
          </p>
        </article>
      </section>
    );
  }

  return (
    <section style={styles.challengeArea}>
      <article style={styles.challengeCard}>
        <h2 style={styles.challengeTitle}>
          Mazmorra
        </h2>

        <p style={styles.challengeDescription}>
          Preparando la expedición.
        </p>
      </article>
    </section>
  );
}

/*
 * ============================================================
 * SELECCIÓN DE CLASE
 * ============================================================
 */

function ClassOption({
  dungeonClass,
}: {
  dungeonClass: DungeonClass;
}) {
  const classImages: Record<DungeonClass, string> = {
    mague: magueClassImage,
    warrior: warriorClassImage,
    rogue: rogueClassImage,
  };

  return (
    <article style={styles.classCard}>
      <img
        src={classImages[dungeonClass]}
        alt={DUNGEON_CLASS_LABELS[dungeonClass]}
        style={styles.classCardImage}
      />
    </article>
  );
}

/*
 * ============================================================
 * HELPERS DE PRESENTACIÓN
 * ============================================================
 */

function getRandomRoomImage(
  roomType: DungeonRoomType,
): string {
  const images = ROOM_IMAGES[roomType];

  const randomIndex = Math.floor(
    Math.random() * images.length,
  );

  return images[randomIndex];
}

function renderHearts(health: number) {
  const safeHealth = Math.max(0, health);

  const visibleSlots = Math.max(
    DUNGEON_INITIAL_HEALTH,
    safeHealth,
  );

  return Array.from(
    { length: visibleSlots },
    (_, index) =>
      index < safeHealth ? '♥' : '♡',
  ).join(' ');
}

function getDungeonTimeText(
  dungeonState: DungeonState,
): string {
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

function getResultTitle(
  dungeonState: DungeonState,
): string {
  if (dungeonState.phase === 'escaped') {
    return 'Has escapado';
  }

  if (dungeonState.phase === 'dead') {
    return 'Has muerto';
  }

  return 'Partida finalizada';
}

function isContinuingCurrentRoom(
  dungeonState: DungeonState,
): boolean {
  return Boolean(
    dungeonState.currentRoom &&
      dungeonState.lastTurnResult &&
      !dungeonState.lastTurnResult.roomCleared,
  );
}