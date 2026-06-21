import { useState } from 'react';

import { DeepDarkDungeon } from './deep-dark-dungeon/DeepDarkDungeon';
import { FightFight } from './fight-fight/Fight';
import { MinigamesScoresList } from './MinigamesScoresList';
import { TheRace } from './the-race/TheRace';

import { styles } from './MinigamesDevPage.styles';

type DevMinigame =
  | 'menu'
  | 'scores'
  | 'the-race'
  | 'fight-fight'
  | 'deep-dark-dungeon';

export function MinigamesDevPage() {
  const [activeGame, setActiveGame] = useState<DevMinigame>('menu');

  function handleExitToMenu() {
    setActiveGame('menu');
  }

  if (activeGame === 'scores') {
    return <MinigamesScoresList onExitToMenu={handleExitToMenu} />;
  }

  return (
    <main style={styles.page}>
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
        <section style={styles.gameWrapper}>
          <button
            type="button"
            style={styles.backButton}
            onClick={handleExitToMenu}
          >
            ← Volver al menú
          </button>

          <div style={styles.gameArea}>
            {activeGame === 'the-race' && (
              <TheRace onExitToMenu={handleExitToMenu} />
            )}

            {activeGame === 'fight-fight' && (
              <FightFight onExitToMenu={handleExitToMenu} />
            )}

            {activeGame === 'deep-dark-dungeon' && (
              <DeepDarkDungeon onExitToMenu={handleExitToMenu} />
            )}
          </div>
        </section>
      )}
    </main>
  );
}