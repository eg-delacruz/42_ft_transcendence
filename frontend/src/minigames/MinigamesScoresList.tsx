import { useEffect, useState } from 'react';

import { getMinigameTopScores } from './components/TopScores.api';
import { styles } from './MinigamesDevPage.styles';
import type { MinigameId, MinigameTopScore } from './types';

type MinigamesScoresListProps = {
  onExitToMenu: () => void;
};

type PortalUser = {
  _id: string;
  email: string;
  role: string;
  display_name?: string;
  avatar_url?: string;
  points?: number;
};

type ApiUsersResponse = {
  error?: string;
  body:
    | PortalUser[]
    | {
        users?: PortalUser[];
      };
  message?: string;
};

const MINIGAMES: { id: MinigameId; label: string }[] = [
  {
    id: 'deep-dark-dungeon',
    label: 'Top score DDD',
  },
  {
    id: 'fight-fight',
    label: 'Fight-fight',
  },
  {
    id: 'the-race',
    label: 'The-race',
  },
];

const EMPTY_SCORES_BY_GAME: Record<MinigameId, MinigameTopScore[]> = {
  'deep-dark-dungeon': [],
  'fight-fight': [],
  'the-race': [],
};

const EMPTY_ERRORS_BY_GAME: Record<MinigameId, string | null> = {
  'deep-dark-dungeon': null,
  'fight-fight': null,
  'the-race': null,
};

export function MinigamesScoresList({
  onExitToMenu,
}: MinigamesScoresListProps) {
  const [scoresByGame, setScoresByGame] = useState<
    Record<MinigameId, MinigameTopScore[]>
  >(EMPTY_SCORES_BY_GAME);

  const [scoreErrorsByGame, setScoreErrorsByGame] = useState<
    Record<MinigameId, string | null>
  >(EMPTY_ERRORS_BY_GAME);

  const [users, setUsers] = useState<PortalUser[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadScores() {
      setIsLoadingScores(true);

      const nextScoresByGame: Record<MinigameId, MinigameTopScore[]> = {
        ...EMPTY_SCORES_BY_GAME,
      };

      const nextErrorsByGame: Record<MinigameId, string | null> = {
        ...EMPTY_ERRORS_BY_GAME,
      };

      await Promise.all(
        MINIGAMES.map(async (minigame) => {
          try {
            const topScores = await getMinigameTopScores(minigame.id);

            nextScoresByGame[minigame.id] = topScores;
            nextErrorsByGame[minigame.id] = null;
          } catch {
            nextScoresByGame[minigame.id] = [];
            nextErrorsByGame[minigame.id] =
              'No se pudieron cargar los top scores';
          }
        }),
      );

      if (!isMounted) {
        return;
      }

      setScoresByGame(nextScoresByGame);
      setScoreErrorsByGame(nextErrorsByGame);
      setIsLoadingScores(false);
    }

    loadScores();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setIsLoadingUsers(true);
        setUsersError(null);

        const loadedUsers = await getPortalUsers();

        if (isMounted) {
          setUsers(loadedUsers);
        }
      } catch {
        if (isMounted) {
          setUsersError('No se pudieron cargar los usuarios.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.scoresPanel}>
        <header style={styles.scoresHeader}>
          <button
            type="button"
            style={styles.backButton}
            onClick={onExitToMenu}
          >
            ← Volver al menú
          </button>

          <div>
            <p style={styles.kicker}>Minigames</p>
            <h1 style={styles.title}>Scores & Users</h1>
            <p style={styles.subtitle}>
              Rankings por minijuego y usuarios registrados.
            </p>
          </div>
        </header>

        <section style={styles.scoresSection}>
          <div style={styles.scoresGrid}>
            {MINIGAMES.map((minigame) => (
              <article key={minigame.id} style={styles.scoreCard}>
                <h2 style={styles.scoreCardTitle}>{minigame.label}</h2>

                {isLoadingScores && (
                  <p style={styles.text}>Cargando scores...</p>
                )}

                {!isLoadingScores && scoreErrorsByGame[minigame.id] && (
                  <p style={styles.errorText}>
                    {scoreErrorsByGame[minigame.id]}
                  </p>
                )}

                {!isLoadingScores &&
                  !scoreErrorsByGame[minigame.id] &&
                  scoresByGame[minigame.id].length === 0 && (
                    <p style={styles.text}>Sin scores registrados.</p>
                  )}

                {!isLoadingScores &&
                  !scoreErrorsByGame[minigame.id] &&
                  scoresByGame[minigame.id].map((topScore) => (
                    <p
                      key={topScore.position}
                      style={{
                        ...styles.scoreRow,
                        ...(topScore.position === 1
                          ? styles.firstScoreRow
                          : {}),
                      }}
                    >
                      Top {topScore.position}:{' '}
                      {topScore.user?.display_name ||
                        topScore.user?.email ||
                        'Sin usuario'}{' '}
                      - {topScore.score} pts
                    </p>
                  ))}
              </article>
            ))}
          </div>
        </section>

        <section style={styles.scoresSection}>
          <h2 style={styles.scoreCardTitle}>Lista de todos los usuarios</h2>

          {isLoadingUsers && <p style={styles.text}>Cargando usuarios...</p>}

          {!isLoadingUsers && usersError && (
            <p style={styles.errorText}>{usersError}</p>
          )}

          {!isLoadingUsers && !usersError && users.length === 0 && (
            <p style={styles.text}>No hay usuarios registrados.</p>
          )}

          {!isLoadingUsers && !usersError && users.length > 0 && (
            <div style={styles.usersTable}>
              <div style={styles.usersHeader}>
                <span>Email</span>
                <span>Display name</span>
                <span>Role</span>
                <span>Points</span>
                <span>ID</span>
              </div>

              {users.map((user) => (
                <div key={user._id} style={styles.userRow}>
                  <span>{user.email}</span>
                  <span>{user.display_name || '-'}</span>
                  <span>{user.role}</span>
                  <span>{user.points ?? 0}</span>
                  <span style={styles.userId}>{user._id}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

async function getPortalUsers(): Promise<PortalUser[]> {
  const response = await fetch('http://localhost:3000/api/users/all', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar los usuarios');
  }

  const data = (await response.json()) as ApiUsersResponse;

  console.log('Users response:', data);

  if (Array.isArray(data.body)) {
    return data.body;
  }

  if (Array.isArray(data.body.users)) {
    return data.body.users;
  }

  return [];
}

