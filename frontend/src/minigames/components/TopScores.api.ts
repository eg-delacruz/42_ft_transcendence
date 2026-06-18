import {
  MINIGAME_API_NAMES,
  type MinigameGameResponse,
  type MinigameId,
  type MinigameTopScore,
} from '../types';

type ApiGameResponse = {
  error?: string;
  body: MinigameGameResponse;
};

type UpdateTopScorePayload = {
  new_score: number;
  user_id: string;
};

export async function getMinigameTopScores(
  minigameId: MinigameId,
): Promise<MinigameTopScore[]> {
  const gameName = MINIGAME_API_NAMES[minigameId];

  const response = await fetch(`/api/games/${gameName}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar los top scores');
  }

  const data = (await response.json()) as ApiGameResponse;

  return mapGameResponseToTopScores(data.body);
}

export async function updateMinigameTopScore(
  minigameId: MinigameId,
  newScore: number,
  userId: string,
): Promise<MinigameTopScore[]> {
  const gameName = MINIGAME_API_NAMES[minigameId];

  const payload: UpdateTopScorePayload = {
    new_score: newScore,
    user_id: userId,
  };

  const response = await fetch(`/api/games/${gameName}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('No se pudo actualizar el top score');
  }

  const data = (await response.json()) as ApiGameResponse;

  return mapGameResponseToTopScores(data.body);
}

function mapGameResponseToTopScores(
  game: MinigameGameResponse,
): MinigameTopScore[] {
  return [
    {
      position: 1,
      user: game.top_1_user,
      score: game.top_1_score,
    },
    {
      position: 2,
      user: game.top_2_user,
      score: game.top_2_score,
    },
    {
      position: 3,
      user: game.top_3_user,
      score: game.top_3_score,
    },
  ];
}