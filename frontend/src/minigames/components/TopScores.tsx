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
    <aside className="text-aldritch text-center p-2 bg-slate-800">
      <p className="mb-3 text-center font-aldrich font-bold text-xl text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-500">Top Scores</p>

      {isLoading && <p className="basicText">Loading...</p>}

      {!isLoading && errorMessage && (
        <p className="basicText text-red-500">{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && (
        <div className="basicText font-aldrich grid gap-0.5">
          {topScores.map((topScore) => ( 
            <p className= "basicText font-aldrich"
              key={topScore.position}
            >
              Top {topScore.position}: {getPlayerName(topScore)} -{' '}
              {topScore.score} pts
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