import { useEffect, useState } from 'react';

import { DeepDarkDungeon } from './deep-dark-dungeon/DeepDarkDungeon';
import { FightFight } from './fight-fight/Fight';
import { MinigamesScoresList } from './MinigamesScoresList';
import { TheRace } from './the-race/TheRace';

import { styles } from './MinigamesDevPage.styles';
import type { MatchData, MatchGame, MatchRole } from '@/hooks/useMatchmaking';

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
};

function toDevMinigame(game: MatchGame): DevMinigame {
  if (game === 'the_race') return 'the-race';
  if (game === 'fight_fight') return 'fight-fight';
  return 'deep-dark-dungeon';
}

export function MinigamesDevPage({ matchGame, matchRole, matchData }: MinigamesDevPageProps) {
  const [activeGame, setActiveGame] = useState<DevMinigame>(
    matchGame ? toDevMinigame(matchGame) : 'menu',
  );

  useEffect(() => {
    if (matchGame) setActiveGame(toDevMinigame(matchGame));
  }, [matchGame]);

  function handleExitToMenu() {
    setActiveGame('menu');
  }

  if (activeGame === 'scores') {
    return <MinigamesScoresList onExitToMenu={handleExitToMenu} />;
  }

  return (
    <main className="">
      {activeGame === 'menu' && (
        <section style={styles.menu}>
          <h1 style={styles.title}>Minigames Dev Page</h1>

          <p style={styles.subtitle}>
            Página temporal para probar los minijuegos a pantalla completa.
          </p>

          <div style={styles.buttons}>
            <button
              type="button"
              style={styles.button}
              onClick={() => setActiveGame('the-race')}
            >
              The Race
            </button>

            <button
              type="button"
              style={styles.button}
              onClick={() => setActiveGame('fight-fight')}
            >
              Fight Fight
            </button>

            <button
              type="button"
              style={styles.button}
              onClick={() => setActiveGame('deep-dark-dungeon')}
            >
              Deep & Dark Dungeon
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => setActiveGame('scores')}
            >
              Ver scores
            </button>
          </div>
        </section>
      )}

      {activeGame !== 'menu' && (
        <section className="w-full h-full">
          {/* <button
            type="button"
            style={styles.backButton}
            onClick={handleExitToMenu}
          >
            ← Volver al menú
          </button> */}

          <div className="w-full h-full">
            {activeGame === 'the-race' && (
              <TheRace onExitToMenu={handleExitToMenu} playerRole={matchRole} matchData={matchData} />
            )}

            {activeGame === 'fight-fight' && (
              <FightFight onExitToMenu={handleExitToMenu} playerRole={matchRole} matchData={matchData} />
            )}

            {activeGame === 'deep-dark-dungeon' && (
              <DeepDarkDungeon onExitToMenu={handleExitToMenu} playerRole={matchRole} matchData={matchData} />
            )}
          </div>
        </section>
      )}
    </main>
  );
}