import { useEffect, useState } from 'react';

import { TheRace } from './the-race/TheRace';
import { FightFight } from './fight-fight/Fight';
import { DeepDarkDungeon } from './deep-dark-dungeon/DeepDarkDungeon';
import { MinigamesScoresList } from './MinigamesScoresList';
import { styles } from './MinigamesDevPage.styles';
import type { MatchData, MatchGame, MatchRole } from '@/hooks/useMatchmaking';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next';

type DevMinigame =
  | 'menu'
  | 'scores'
  | 'the-race'
  | 'fight-fight'
  | 'deep-dark-dungeon';

type MinigamesDevPageProps = {
  matchGame?: MatchGame;
  matchRole?: MatchRole;
  matchData?: MatchData | null;
  clearMatchData?: () => void;
};

const SHOW_DEV_MENU = import.meta.env.DEV;

export function MinigamesDevPage({ matchGame, matchRole, matchData, clearMatchData, }: MinigamesDevPageProps) {
  const [devGame, setDevGame] = useState<DevMinigame>('menu');
  const [dismissedMatchId, setDismissedMatchId] = useState<string | undefined>(undefined);
  const { t } = useTranslation();

  const game = matchData?.game ?? matchGame;
  const role = matchData?.role ?? matchRole;
  const matchId = matchData?.matchId;
  const dismissed = matchId !== undefined && dismissedMatchId === matchId;

  function handleExitToMenu() {
    if (matchData)
		clearMatchData?.();
	else
		setDevGame('menu');
  }

  if (game && !dismissed)
  {
	const gameKey = matchId ?? game;

	    return (
     	<main className="h-full w-full">
			<section className="w-full h-full">
					{game === 'the_race' && (
					<TheRace key={gameKey} onExitToMenu={handleExitToMenu} playerRole={role} matchData={matchData} />
					)}

					{game === 'fight_fight' && (
					<FightFight key={gameKey} onExitToMenu={handleExitToMenu} playerRole={role} matchData={matchData} />
					)}

					{game === 'deep_&_dark' && (
					<DeepDarkDungeon key={gameKey} onExitToMenu={handleExitToMenu} playerRole={role} matchData={matchData} />
					)}
			</section>
		</main>
    );
  }

  // ── Sin partida (o ya salió de la actual) ──
  if (!SHOW_DEV_MENU) {
    return (
      <main className="">
        <section className="w-full h-full flex items-center justify-center text-slate-300">
          Esperando a la siguiente partida...
        </section>
      </main>
    );
  }

  // ── Menú de debug (solo desarrollo) ──
  if (devGame === 'scores') {
    return <MinigamesScoresList onExitToMenu={handleExitToMenu} />;
  }

  return (
    // <main className="">
    //   {devGame === 'menu' && (
    //     <section style={styles.menu}>
    //       <h1 style={styles.title}>Minigames Dev Page</h1>

    //       <p style={styles.subtitle}>
    //         Esperando partida. Menú de pruebas (solo desarrollo).
    //       </p>

    //       <div style={styles.buttons}>
    //         <button type="button" style={styles.button} onClick={() => setDevGame('the-race')}>
    //           The Race
    //         </button>

    //         <button type="button" style={styles.button} onClick={() => setDevGame('fight-fight')}>
    //           Fight Fight
    //         </button>

    //         <button type="button" style={styles.button} onClick={() => setDevGame('deep-dark-dungeon')}>
    //           Deep & Dark Dungeon
    //         </button>

    //         <button type="button" style={styles.secondaryButton} onClick={() => setDevGame('scores')}>
    //           Ver scores
    //         </button>
    //       </div>
    //     </section>
    //   )}

    //   {devGame !== 'menu' && (
    //     <section className="w-full h-full">
    //       <div className="w-full h-full">
    //         {devGame === 'the-race' && <TheRace onExitToMenu={handleExitToMenu} />}
    //         {devGame === 'fight-fight' && <FightFight onExitToMenu={handleExitToMenu} />}
    //         {devGame === 'deep-dark-dungeon' && <DeepDarkDungeon onExitToMenu={handleExitToMenu} />}
    //       </div>
    //     </section>
    //   )}
    // </main>
	<main className="min-h-screen w-full flex justify-center items-center">
		<section className="flex-1 flex flex-col items-center justify-center text-center gap-4" aria-hidden="true">
				<FontAwesomeIcon icon={faSpinner} className="text-white text-4xl animate-spin duration-100 ease-in-out"/>
				<p className="basicText">{t("game.matchmaking")}</p>
		</section>
	</main>
  );
}