import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/context/context';
import { TopScores } from '../components/TopScores';
import { useMinigameContext } from '../context/minigameContext';
import { updateMinigameTopScore } from '../components/TopScores.api';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

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
  type MinigameId,
  type DungeonClass,
  type DungeonRoomType,
  type DungeonState,
} from './DDD.types';

import type { MatchData, MatchRole } from '@/hooks/useMatchmaking';
import { useGameSync, type RemoteGameAction } from '@/hooks/useGameSync';
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
  onMinigameChange?: (minigameId: MinigameId) => void;
  playerRole?: MatchRole;
  matchData?: MatchData | null;
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

export function DeepDarkDungeon({ onExitToMenu, onMinigameChange, playerRole, matchData }: DeepDarkDungeonProps) {
	const { setActiveGame } = useMinigameContext();
	const { user } = useAuthContext();
	const [dungeonState, setDungeonState] = useState<DungeonState>(createInitialDungeonState,);
	const hasSubmittedScore = useRef(false);
	const { t } = useTranslation();

  const { sendAction } = useGameSync(
    'deep_&_dark',
    (_action: RemoteGameAction) => undefined,
    (state) => setDungeonState(state.state as DungeonState),
  );

	useEffect(() => {
    	setActiveGame('deep-dark-dungeon');
    	return () => setActiveGame(null); // clear when it unmounts
  	}, [setActiveGame]);

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

    const scoreUserId = matchData?.players.find((player) => player.role === 'solo')?.userId ?? user?.id ?? user?._id;
    if (!scoreUserId) {
      return;
    }

    updateMinigameTopScore(
      'deep-dark-dungeon',
      dungeonState.player.score,
      scoreUserId,
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
      if (event.repeat || playerRole !== 'solo') {
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
      sendAction('dungeon_key', event.code);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [dungeonState.phase, playerRole, sendAction]);

  const shouldShowClassSelection =
    dungeonState.phase === 'choosingClass';

  const shouldShowHand =
    dungeonState.phase === 'choosingCard' ||
    dungeonState.phase === 'resolvingRoom';

  return (
  <main className="min-h-screen w-full overflow-auto bg-slate-950 text-zinc-100 flex justify-center font-mono">
    <section
      className="relative flex w-full flex-col gap-1 overflow-hidden bg-cover bg-center bg-no-repeat px-12 py-9"
      style={{ backgroundImage: `url(${dungeonBackground})` }}
    >
      <header className="mt-6 text-center">
        <p className="m-0 text-sm uppercase tracking-[0.28em] text-zinc-400">Minigame</p>

        <h1 className="mt-2 mb-1 text-[40px] leading-none text-zinc-50">
          Deep & Dark Dungeon
        </h1>

        <p className="m-0 text-base text-zinc-200">
			{t("ddd.header")}
        </p>
      </header>

      <section className="grid w-full grid-cols-[360px_minmax(520px,1fr)] items-start gap-8">
        <PlayerHud
          dungeonState={dungeonState}
          playerName={getDungeonPlayerName(matchData, user)}
        />

        <ActiveChallenge dungeonState={dungeonState} />
      </section>

      <section className="flex w-full flex-1 items-center justify-evenly text-center">
          {dungeonState.phase ===
            'bettingCountdown' && (
            <DungeonTutorial />
          )}

          {shouldShowClassSelection && (
          <section className="w-full rounded-xl border border-zinc-300/40 bg-zinc-950/80 p-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <p className="m-0 mb-5 text-sm uppercase tracking-[0.16em] text-zinc-400">
                {t("ddd.classes")}
              </p>

            <section className="flex flex-wrap items-center justify-center gap-4">
                <ClassOption dungeonClass="mague" />
                <ClassOption dungeonClass="warrior" />
                <ClassOption dungeonClass="rogue" />
              </section>

            <p className="mt-4 text-sm text-zinc-300">
                {DUNGEON_CLASS_CONTROL_TEXT}
              </p>

            <p className="mt-2 text-sm text-zinc-200">
                {t("ddd.defClassWarn")}
              </p>
            </section>
          )}

          {dungeonState.phase === 'drawingCards' && (
          <section className="w-full max-w-4xl rounded-xl border border-zinc-300/40 bg-zinc-950/80 p-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <h2 className="m-0 text-2xl text-zinc-50">
                {t('ddd.drawing.title', { defaultValue: 'Robando cartas...' })}
              </h2>

            <p className="mt-3 text-sm text-zinc-200">
                {isContinuingCurrentRoom(dungeonState)
                  ? t('ddd.drawing.continues', { defaultValue: 'El reto continúa. Robando nuevas cartas para intentarlo de nuevo.' })
                  : t('ddd.drawing.next', { defaultValue: 'Preparando la siguiente sala.' })}
              </p>
            </section>
          )}

          {shouldShowHand && (
          <section className="flex flex-col w-full max-w-4xl">
            <section className="flex flex-row w-full max-w-4xl items-center">
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

              <p className="text-sm text-zinc-300">
                {DUNGEON_CARD_CONTROL_TEXT}
              </p>
            </section>
          )}

          {(dungeonState.phase === 'escaped' ||
            dungeonState.phase === 'dead' ||
            dungeonState.phase === 'finished') && (
            <section className="w-full max-w-4xl rounded-xl border border-zinc-300/40 bg-zinc-950/80 p-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <h2 className="m-0 text-2xl text-zinc-50">
                {t("ddd.score")}{getResultTitle(dungeonState, t)}
              </h2>

              <p className="mt-3 text-lg text-zinc-100">
                {dungeonState.player.score}
              </p>

              <p className="mt-2 text-sm text-zinc-200">
                {t("game.backToMenu")}{' '}
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
      <article className="flex h-fit w-auto items-center justify-center p-2 text-center">
      <img
        src={image}
        alt={card.name}
          className="block h-auto max-h-101.25 w-82.5 object-contain"
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
	const { t } = useTranslation();
  return (
      <section className="w-full max-w-6xl rounded-xl border border-zinc-300/40 bg-zinc-950/80 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-lg border border-zinc-300/20 bg-zinc-900/70 p-5 text-center">
            <h3 className="m-0 text-xl text-zinc-50">
            	{t("ddd.tutorial.success.title")}
          	</h3>
            <p className="mt-3 text-sm text-zinc-200">
            	{t("ddd.tutorial.success.explanation")}
          	</p>
            <img
				src={tutorialSuccessImage}
				alt="Carta que supera un reto"
				className="mx-auto mt-4 h-auto w-full max-w-55 object-contain"
          	/>
        </article>

        <article className="rounded-lg border border-zinc-300/20 bg-zinc-900/70 p-5 text-center">
            <h3 className="m-0 text-xl text-zinc-50">
            	{t("ddd.tutorial.dmg.title")}
          	</h3>
            <p className="mt-3 text-sm text-zinc-200">
            	{t("ddd.tutorial.dmg.explanation")}
          	</p>
            <img
				src={tutorialDamageImage}
				alt={t('ddd.tutorial.dmg.alt', { defaultValue: 'Carta que no supera el reto y provoca pérdida de vida' })}
				className="mx-auto mt-4 h-auto w-full max-w-55 object-contain"
			/>
        </article>

        <article className="rounded-lg border border-zinc-300/20 bg-zinc-900/70 p-5 text-center">
            <h3 className="m-0 text-xl text-zinc-50">
				{t("ddd.tutorial.protection.title")}
			</h3>
            <p className="mt-3 text-sm text-zinc-200">
				{t("ddd.tutorial.protection.explanation")}
			</p>
            <img
				src={tutorialProtectionImage}
				alt={t('ddd.tutorial.protection.alt', { defaultValue: 'Carta que previene el daño' })}
				className="mx-auto mt-4 h-auto w-full max-w-55 object-contain"
			/>
        </article>
      </div>

        <div className="mt-5 rounded-lg border border-zinc-300/20 bg-zinc-900/70 p-4 text-center">
          <p className="m-0 text-sm text-zinc-200">
			{t("ddd.objective")}
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
  playerName,
}: {
  dungeonState: DungeonState;
  playerName: string;
}) {
  const selectedClass = dungeonState.player.class;
  const { t } = useTranslation();

  return (
      <aside className="flex min-h-65 w-full flex-col justify-center gap-3 rounded-lg border-2 border-zinc-300 bg-zinc-900/95 px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
	      <HudRow label={t("ddd.HUD.player")} value={playerName} />

      <HudRow
        label={t("ddd.HUD.class")}
        value={
          selectedClass
            ? `${DUNGEON_CLASS_ICONS[selectedClass]} ${
                DUNGEON_CLASS_LABELS[selectedClass]
              }`
            : 'N/A'
        }
      />

        <div className="grid grid-cols-[118px_1fr] items-center gap-3 border-b border-white/30 pb-2">
          <span className="text-[18px] font-bold uppercase tracking-[0.12em] text-zinc-100">
            {t("ddd.points")}
          </span>

          <span className="flex items-center gap-2">
            <span className="w-full text-center text-[18px] font-bold text-zinc-100">
            {dungeonState.player.score}
          </span>

          <img
            src={monedasImage}
            alt=""
              className="block h-8 w-8 object-contain"
          />
        </span>
      </div>

      <HudRow
        label={t("ddd.HUD.streak")}
        value={`${dungeonState.player.streak} ${
          dungeonState.player.streak > 0 ? '🔥' : ''
        }`}
      />

      <HudRow
        label={t("ddd.HUD.time")}
        value={getDungeonTimeText(dungeonState, t)}
      />

      <HudRow
        label={t("ddd.HUD.rooms")}
        value={String(
          dungeonState.player.roundsSurvived,
        )}
      />

        <div className="grid grid-cols-[118px_1fr] items-center gap-3 border-b border-white/30 pb-2">
          <span className="text-[18px] font-bold uppercase tracking-[0.12em] text-zinc-100">
            {t("ddd.HUD.health")}
          </span>

          <span className="text-[22px] leading-none tracking-[0.16em] text-red-500 [text-shadow:0_1px_0_#000]">
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
      <div className="grid grid-cols-[118px_1fr] items-center gap-3 border-b border-white/30 pb-2">
        <span className="text-[18px] font-bold uppercase tracking-[0.12em] text-zinc-100">
        {label}:
      </span>

        <span className="w-full text-center text-[18px] font-bold text-zinc-100">
        {value}
      </span>
    </div>
  );
}

function getDungeonPlayerName(matchData: MatchData | null | undefined, user: ReturnType<typeof useAuthContext>['user']): string {
  return matchData?.players.find((player) => player.role === 'solo')?.username ?? user?.username ?? 'Jugador';
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
  const { t } = useTranslation();
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

  if ( dungeonState.phase === 'bettingCountdown') 
  {
    return (
        <section className="flex min-h-80 w-full flex-col items-center justify-start gap-3">
          <article className="flex min-h-105 w-140 flex-col items-center justify-center gap-3 p-2 text-center">
            <h2 className="m-0 text-2xl text-zinc-50">
				{t("ddd.ready")}
          </h2>

            <p className="m-0 text-7xl font-bold text-zinc-50">
            {dungeonState.bettingCountdown}
          </p>

            <p className="m-0 text-sm text-zinc-200">

          </p>
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'choosingClass') {
    return (
        <section className="flex min-h-80 w-full flex-col items-center justify-start gap-3">
          <article className="flex min-h-105 w-140 flex-col items-center justify-center gap-3 p-2 text-center">
            <h2 className="m-0 text-2xl text-zinc-50">
            {t("ddd.chooseClass")}
          </h2>

            <p className="m-0 text-7xl font-bold text-zinc-50">
            {dungeonState.classSelectionCountdown}
          </p>

            <p className="m-0 text-sm text-zinc-200">
            
          </p>
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'drawingCards') {
    const shouldContinueRoom =
      isContinuingCurrentRoom(dungeonState);

    return (
        <section className="flex min-h-80 w-full flex-col items-center justify-start gap-3">
          <article className="flex min-h-105 w-140 flex-col items-center justify-center gap-3 p-2 text-center">
          {shouldContinueRoom &&
          dungeonState.currentRoom &&
          roomImage ? (
            <img
              src={roomImage}
              alt={dungeonState.currentRoom.name}
                className="block h-auto max-h-101.25 w-82.5 object-contain"
            />
          ) : (
			<>
				<h2 className="m-0 text-2xl text-zinc-50">
					{t("ddd.newRoom")}
				</h2>
				<p className="m-0 text-sm text-zinc-200">
					{t("ddd.ready")}
				</p>
            </>
          )}
        </article>
      </section>
    );
  }

  if ((dungeonState.phase === 'choosingCard' || dungeonState.phase === 'resolvingRoom') && dungeonState.currentRoom) {
    return (
      <section className="flex min-h-80 w-full flex-col items-center justify-start gap-3">
        <article className="flex min-h-105 w-140 flex-col items-center justify-center gap-3 p-2 text-center">
          {roomImage && (
            <img
              src={roomImage}
              alt={dungeonState.currentRoom.name}
              className="block h-auto max-h-101.25 w-82.5 object-contain"
            />
          )}

          {dungeonState.phase ===
            'choosingCard' && (
            <p className="m-0 text-lg text-zinc-100">
              {
                dungeonState.cardSelectionCountdown
              }
              {t("ddd.choosingPhase")}
            </p>
          )}

          {dungeonState.phase ===
            'resolvingRoom' && (
            <>
              <p className="m-0 text-lg text-zinc-100">
                {dungeonState.resolveCountdown}s
                {t("ddd.resolving")}
              </p>

              {dungeonState.lastTurnResult && (
                <p className="m-0 text-sm text-zinc-200">
                  {t(dungeonState.lastTurnResult.message)}
                </p>
              )}
            </>
          )}
        </article>
      </section>
    );
  }

  if (dungeonState.phase === 'escaped' || dungeonState.phase === 'dead' || dungeonState.phase === 'finished') {
    return (
      <section className="flex min-h-80 w-full flex-col items-center justify-start gap-3">
        <article className="flex min-h-105 w-140 flex-col items-center justify-center gap-3 p-2 text-center">
          <h2 className="m-0 text-2xl text-zinc-50">
            {getResultTitle(dungeonState, t)}
          </h2>

          <p className="m-0 text-sm text-zinc-200">
            {t("ddd.score")}{dungeonState.player.score}
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="flex min-h-80 w-full flex-col items-center justify-start gap-3">
      <article className="flex min-h-105 w-140 flex-col items-center justify-center gap-3 p-2 text-center">
        <h2 className="m-0 text-2xl text-zinc-50">
          {t("ddd.dungeon")}
        </h2>

        <p className="m-0 text-sm text-zinc-200">
         	{t("ddd.preparingPhase")}
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
	    <article className="flex items-center justify-center rounded-lg border border-zinc-300/20 bg-zinc-900/70 p-2 transition-transform duration-150 hover:-translate-y-0.5">
      <img
        src={classImages[dungeonClass]}
        alt={DUNGEON_CLASS_LABELS[dungeonClass]}
	        className="block h-auto w-28 object-contain"
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
  t: TFunction,
): string {
  switch (dungeonState.phase) {
    case 'bettingCountdown':
      return t('ddd.time.bets', { seconds: dungeonState.bettingCountdown, defaultValue: '{{seconds}}s apuestas' });

    case 'choosingClass':
      return t('ddd.time.class', { seconds: dungeonState.classSelectionCountdown, defaultValue: '{{seconds}}s clase' });

    case 'drawingCards':
      return isContinuingCurrentRoom(dungeonState)
        ? t('ddd.time.sameChallenge', { defaultValue: 'Mismo reto' })
        : t('ddd.time.drawing', { defaultValue: 'Robando cartas' });

    case 'choosingCard':
      return t('ddd.time.card', { seconds: dungeonState.cardSelectionCountdown, defaultValue: '{{seconds}}s carta' });

    case 'resolvingRoom':
      return t('ddd.time.resolve', { seconds: dungeonState.resolveCountdown, defaultValue: '{{seconds}}s resolver' });

    case 'escaped':
    case 'dead':
    case 'finished':
      return t('ddd.time.menu', { seconds: dungeonState.resultsCountdown, defaultValue: '{{seconds}}s menú' });

    default:
      return '-';
  }
}

function getResultTitle(
  dungeonState: DungeonState,
  t: TFunction,
): string {
  if (dungeonState.phase === 'escaped') {
    return t('ddd.result.escaped', { defaultValue: 'Has escapado' });
  }

  if (dungeonState.phase === 'dead') {
    return t('ddd.result.dead', { defaultValue: 'Has muerto' });
  }

  return t('ddd.result.finished', { defaultValue: 'Partida finalizada' });
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