import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

export const useMatchmaking = () => {
  const { socket } = useSocket();
  const [inQueue, setInQueue] = useState(false);
  const [matchData, setMatchData] = useState<{ roomId: string; players: string[] } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('queue_status', (data) => {
      if (data.status === 'waiting') setInQueue(true);
      if (data.status === 'cancelled') setInQueue(false);
    });

    socket.on('match_found', (data) => {
      setInQueue(false);
      setMatchData(data);
    });

    return () => {
      socket.off('queue_status');
      socket.off('match_found');
    };
  }, [socket]);

  const joinQueue = () => socket?.emit('join_matchmaking');
  const leaveQueue = () => socket?.emit('leave_matchmaking');

  return { inQueue, matchData, joinQueue, leaveQueue };
};