import { useEffect, useState } from 'react';

import type { MinigameId, MinigameTopScore } from '../types';
import { getMinigameTopScores } from './TopScores.api';
import { styles } from './TopScores.styles';

type TopScoresProps = {
  minigameId: MinigameId;
};

export function TopScores({ minigameId }: TopScoresProps) {
  const [topScores, setTopScores] = useState<MinigameTopScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTopScores() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const scores = await getMinigameTopScores(minigameId);

        if (isMounted) {
          setTopScores(scores);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Top scores unavailable');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTopScores();

    return () => {
      isMounted = false;
    };
  }, [minigameId]);

  return (
    <aside style={styles.container}>
      <p style={styles.title}>Top Scores</p>

      {isLoading && <p style={styles.text}>Loading...</p>}

      {!isLoading && errorMessage && (
        <p style={styles.errorText}>{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && (
        <div style={styles.list}>
          {topScores.map((topScore) => (
            <p
              key={topScore.position}
              style={{
                ...styles.row,
                ...(topScore.position === 1 ? styles.firstRow : {}),
              }}
            >
              Top{topScore.position}: {getPlayerName(topScore)} -{' '}
              {topScore.score}pts
            </p>
          ))}
        </div>
      )}
    </aside>
  );
}

function getPlayerName(topScore: MinigameTopScore): string {
  return topScore.user?.display_name ?? 'Jugador';
}