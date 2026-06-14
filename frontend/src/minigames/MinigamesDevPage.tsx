import { useState } from 'react';

import { TheRace } from './the-race/TheRace';
import { FightFight } from './fight-fight/Fight';
import { DeepDarkDungeon } from './deep-dark-dungeon/DeepDarkDungeon';

type DevMinigame =
  | 'menu'
  | 'the-race'
  | 'fight-fight'
  | 'deep-dark-dungeon';

export function MinigamesDevPage() {
  const [activeGame, setActiveGame] = useState<DevMinigame>('menu');

  function handleExitToMenu() {
    setActiveGame('menu');
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
    background: '#101018',
    color: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    overflow: 'hidden',
  },
  menu: {
    width: 'min(720px, 90vw)',
    padding: '32px',
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 12px',
    fontSize: '32px',
  },
  subtitle: {
    margin: '0 0 32px',
    color: '#a1a1aa',
  },
  buttons: {
    display: 'grid',
    gap: '16px',
  },
  button: {
    padding: '16px 24px',
    borderRadius: '12px',
    border: '1px solid #71717a',
    background: '#27272f',
    color: '#f4f4f5',
    fontSize: '20px',
    cursor: 'pointer',
  },
  gameWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    zIndex: 10,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #71717a',
    background: '#27272f',
    color: '#f4f4f5',
    cursor: 'pointer',
  },
  gameArea: {
    width: '100%',
    height: '100%',
  },
};