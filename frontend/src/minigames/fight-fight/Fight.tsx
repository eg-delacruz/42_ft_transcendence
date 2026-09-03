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
  FIGHT_ACTION_LABELS,
  FIGHT_INITIAL_HEALTH,
  FIGHT_PLAYER_1_CONTROLS_TEXT,
  FIGHT_PLAYER_2_CONTROLS_TEXT,
  FIGHT_PLAYER_ACTION_ICONS,
  FIGHT_PLAYER_IDLE_ICONS,
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
	<main className="w-full h-full flex items-center justify-center font-pressstart p-0 relative overflow-hidden">
		<TopScores minigameId="fight-fight" />

		<div className="w-full h-full grid grid-rows-[20%_60%_20%] relative overflow-hidden">
			{/* TopHUD - payer status and timer */}
			<section className="w-full h-1/5 p-4 grid grid-cols-3 gap-10">
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
			{/* Animations and prompt */}
			<section className="grid grid-cols-3 items-center justify-center gap-10 p-5 bg-cover bg-center bg-[url(../minigames/assets/fight-background.jpg)]">
				<DecisionDisplay player={fightState.player1} phase={fightState.phase} />
					<RoundResult
					fightState={fightState}
					player1Name={player1Name}
					player2Name={player2Name}
					/>
				<DecisionDisplay player={fightState.player2} phase={fightState.phase} />
			</section>
			{/* Button guide */}
			<ActionGuide className="w-full h-1/5"/>
			<section className="hidden">
  				<p className="m-0 text-md"	>{FIGHT_PLAYER_1_CONTROLS_TEXT}</p>
				<p className="m-0 text-md"	>{FIGHT_PLAYER_2_CONTROLS_TEXT}</p>
			</section>

		{fightState.phase === 'finished' && (
		<section className="absolute left-1/2 top-1/2 -translate-1/2 z-10 flex flex-col align-center justify-center text-center gap-3">
			<h2 className="basicText text-4xl text-amber-50 text-shadow-lg text-shadow-zinc-900">Combate terminado</h2>

			<p className="m-0 text-xl">
			  Ganador: {getFightWinnerDisplayName(
				fightState,
				player1Name,
				player2Name,
			  )}
			</p>

			<p className="basicText text-lg">
			  Volviendo al menú en {fightState.resultsCountdown}...
			</p>
		</section>
		)}
	  </div>
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
  const width = `${Math.round(healthPercentage)}%`;
  const isLeft = side === 'left';

  return (
	<article
		className={
			isLeft
			? 'flex flex-col items-center justify-start gap-2 w-full'
			: 'flex flex-col items-center justify-start gap-2 w-full'
		}
	>
  	<h2
    	className={
			isLeft
			? 'm-0 text-md uppercase basicText items-center justify-center text-center gap-2 text-blue-500'
			: 'm-0 text-md uppercase basicText items-center justify-center text-center gap-2 text-red-500'
		}
	>
		<span>{label}</span>
		<span>{player.score} pts</span>
	</h2>

	<div className="w-full h-8 border-2 border-zinc-50 rounded-lg overflow-hidden p-1">
		<div
			className={
				isLeft
				? 'h-full rounded-lg transition-all ease-linear duration-160 bg-blue-500'
				: 'h-full rounded-lg transition-all ease-linear duration-160 bg-red-500'
			}
			style = {{ width }}
		/>
		</div>
	</article>
  );
}

function FightClock({ fightState }: { fightState: FightState }) {
  return (
	<div className="flex flex-col items-center justify-start gap-2 bg-cover bg-no-repeat bg-center bg-[url(../minigames/assets/fight-sign.png)]">
	  <div className="w-full h-full flex flex-col items-center justify-center mt-4">
		<p className="basicText text-md">{getClockLabel(fightState)}</p>
		<p className="basicText text-2xl">{getClockValue(fightState)}</p>
	  </div>
	  <p className="basicText text-lg">Ronda {fightState.round}</p>
	</div>
  );
}

function DecisionDisplay({
  player,
  phase,
}: {
  player: FightPlayer;
  phase: FightState['phase'];
}) {
  const displayedAction = getDisplayedAction(player, phase);
  const actionIcon = displayedAction
	? FIGHT_PLAYER_ACTION_ICONS[player.id][displayedAction]
	: FIGHT_PLAYER_IDLE_ICONS[player.id];
  const isImageIcon =
	typeof actionIcon === 'string' &&
	/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(actionIcon);

  return (
	<div className="w-full h-full flex flex-col items-center justify-center gap-2">
		<p className="m-0 w-full h-2/3 flex items-center justify-center bg-cover bg-center"
 			style={{ backgroundImage: isImageIcon ? `url(${actionIcon})` : undefined,
		}}>
		</p>
		<p className="basicText text-sm">
			{displayedAction
				? FIGHT_ACTION_LABELS[displayedAction]
				: 'Sin acción'}
		</p>
		<p className="basicText text-sm">Racha: {player.consecutiveWins}</p>
	</div>
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
	  <section className="flex flex-col items-center justify-center gap-6 text-center">
		<p className="basicText text-2xl">Apuestas</p>
		<p className="basicText text-lg">El combate empezará automáticamente.</p>
	  </section>
	);
  }

  if (fightState.phase === 'selecting') {
	return (
	  <section className="flex flex-col items-center justify-center gap-6 text-center">
		<p className="basicText text-2xl">Elige acción</p>
		<p className="basicText text-lg">Tienes {fightState.selectionTimeLeft}s.</p>
	  </section>
	);
  }

  if (fightState.phase === 'resolving') {
	return (
	  <section className="flex flex-col items-center justify-center gap-6 text-center">
		<p className="basicText text-2xl">Resolviendo</p>

		{fightState.lastRoundResult ? (
		  <p className="basicText text-lg">
			{fightState.lastRoundResult.message}
		  </p>
		) : (
		  <p className="basicText text-lg">Comparando acciones...</p>
		)}
	  </section>
	);
  }

  if (fightState.phase === 'finished') {
	return (
	  <section className="flex flex-col items-center justify-center gap-6 text-center">
		<p className="basicText text-4xl">KO</p>

		<p className="m-0 text-center basicText text-4xl">
		  {getFightWinnerDisplayName(fightState, player1Name, player2Name)}
		</p>
	  </section>
	);
  }

  return null;
}

function ActionGuide() {
  return (
	<section className="grid grid-cols-4 items-center justify-center p-4 gap-3 border-2 border-zinc-50 basicText">
	  <ActionGuideItem
		arrow="←"
		name="Puñetazo"
		colorStyle="text-blue-500"
		rule={
		  <>
			<ActionKeyword colorStyle="text-blue-500">
			  Puñetazo
			</ActionKeyword>{' '}
			gana a{' '}
			<ActionKeyword colorStyle="text-green-500">
			  Agarre
			</ActionKeyword>
		  </>
		}
	  />

	  <ActionGuideItem
		arrow="↑"
		name="Agarre"
		colorStyle="text-green-500"
		rule={
		  <>
			<ActionKeyword colorStyle="text-green-500">
			  Agarre
			</ActionKeyword>{' '}
			gana a{' '}
			<ActionKeyword colorStyle="text-red-500">
			  Patada
			</ActionKeyword>
		  </>
		}
	  />

	  <ActionGuideItem
		arrow="→"
		name="Patada"
		colorStyle="text-red-500"
		rule={
		  <>
			<ActionKeyword colorStyle="text-red-500">
			  Patada
			</ActionKeyword>{' '}
			gana a{' '}
			<ActionKeyword colorStyle="text-blue-500">
			  Puñetazo
			</ActionKeyword>
		  </>
		}
	  />

	  <ActionGuideItem
		arrow="↓"
		name="Esquiva"
		colorStyle="text-yellow-500"
		rule={
		  <>
			<ActionKeyword colorStyle="text-yellow-500">
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
  colorStyle: string;
}) {
  return (
	<article className="h-full flex flex-row items-center gap-3">
	  <div className="w-1/2 h-auto aspect-square border-2 border-zinc-50 rounded-lg text-center text-2xl">{arrow}</div>

	  <div className="flex flex-col gap-4">
		<p className={['basicText uppercase text-md', colorStyle].filter(Boolean).join(' ')}
			>{name}</p>
		<p className="m-0 text-xs uppercase">{rule}</p>
	  </div>
	</article>
  );
}

function getDisplayedAction(
  player: FightPlayer,
  phase?: FightState['phase'],
) {
  const playerWithSelection = player as FightPlayer & {
	selectedAction?: keyof typeof FIGHT_ACTION_LABELS | null;
  };

  if (playerWithSelection.selectedAction) {
	return playerWithSelection.selectedAction;
  }

  if (phase === 'selecting') {
	return null;
  }

  return player.previousAction ?? null;
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
  colorStyle: string;
}) {
  return <span className={['basitText uppercase text-md font-bold', colorStyle].filter(Boolean).join(' ')}>{children}</span>;
}