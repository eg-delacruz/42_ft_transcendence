import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/context';
import { useSocket } from './useSocket';

export type MatchGame = 'the_race' | 'fight_fight' | 'deep_&_dark';
export type MatchRole = 'player1' | 'player2' | 'solo' | 'spectator';

export type MatchData = {
  roomId: string;
  game: MatchGame;
  players: { userId: string; username: string; role: MatchRole }[];
  spectators: string[];
  role: MatchRole;
};

export type MatchmakingLog = {
  id?: string; // lo genera el servidor; usarlo como key de React
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
};

export const useMatchmaking = () => {
  const { socket } = useSocket();
  const { user } = useAuthContext();
  // Dependemos del id (string estable) y no del objeto user, que puede cambiar de
  // identidad en cada render del contexto y relanzaba el efecto.
  const userId = user?.id ?? user?._id;
  const [inQueue, setInQueue] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [logs, setLogs] = useState<MatchmakingLog[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const endTimer = () => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

  useEffect(() => {
    if (!socket) 
		return;
    const handleQueueStatus = (data: { status: string }) => {
      console.info('[matchmaking]', data);
      if (data.status === 'waiting') 
		setInQueue(true);
      if (data.status === 'cancelled') 
		setInQueue(false);
    };

    const handleMatchFound = (data: Omit<MatchData, 'role'>) => {
      console.info('[matchmaking] partida encontrada', data);
      const normalizedPlayers = data.players.map((player) => ({
        ...player,
        username: player.username ?? player.userId,
      }));
      const participant = normalizedPlayers.find((player) => player.userId === userId);
      const role = participant?.role ?? 'spectator';

      setInQueue(false);
      setMatchData({ ...data, players: normalizedPlayers, role });
    };

    const handleMatchmakingLog = (log: MatchmakingLog) => {
      console.info(`[matchmaking] ${log.message}`, log.details);
      setLogs((current) => [log, ...current].slice(0, 8));
    };

    socket.on('queue_status', handleQueueStatus);
    socket.on('match_found', handleMatchFound);
    socket.on('matchmaking:log', handleMatchmakingLog);

    return () => {
      socket.off('queue_status', handleQueueStatus);
      socket.off('match_found', handleMatchFound);
      socket.off('matchmaking:log', handleMatchmakingLog);
    };
  }, [socket, userId]);

  const joinQueue = () => {
	socket?.emit('join_matchmaking')
};
  const leaveQueue = () => {
	socket?.emit('leave_matchmaking')
};

  return { inQueue, matchData, logs, joinQueue, leaveQueue };
};