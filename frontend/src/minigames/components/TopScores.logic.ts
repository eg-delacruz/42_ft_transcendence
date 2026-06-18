import type { MinigameTopScore } from '../types';

export function shouldEnterTopScores(
  score: number,
  topScores: MinigameTopScore[],
): boolean {
  if (topScores.length < 3) {
    return true;
  }

  return topScores.some((topScore) => score > topScore.score);
}

export function getTopScorePosition(
  score: number,
  topScores: MinigameTopScore[],
): 1 | 2 | 3 | null {
  const sortedScores = [...topScores].sort((a, b) => b.score - a.score);

  if (!sortedScores[0] || score > sortedScores[0].score) {
    return 1;
  }

  if (!sortedScores[1] || score > sortedScores[1].score) {
    return 2;
  }

  if (!sortedScores[2] || score > sortedScores[2].score) {
    return 3;
  }

  return null;
}