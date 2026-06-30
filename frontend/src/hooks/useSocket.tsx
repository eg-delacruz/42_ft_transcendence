import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useAuthContext } from '@/context/context';

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

type PongPayload = {
  ok: boolean;
  timestamp: number;
};

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
  const { user, loading } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastPong, setLastPong] = useState<PongPayload | null>(null);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setStatus('idle');
      setError(null);
      setLastPong(null);
      return;
    }

    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        setStatus('connected');
        setError(null);
      });

      socket.on('disconnect', () => {
        setStatus('disconnected');
      });

      socket.on('reconnect_attempt', () => {
        setStatus('reconnecting');
      });

      socket.on('connect_error', (socketError: Error) => {
        setStatus('error');
        setError(socketError.message);
      });

      socket.on('pong', (payload: PongPayload) => {
        setLastPong(payload);
      });

      socketRef.current = socket;
    }

    setStatus('connecting');
    socketRef.current.connect();

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setStatus('idle');
    };
  }, [isAuthenticated, loading]);

  const sendPing = () => {
    socketRef.current?.emit('ping');
  };

  return {
    socket: socketRef.current,
    status,
    error,
    lastPong,
    sendPing,
    isAuthenticated,
  };
}