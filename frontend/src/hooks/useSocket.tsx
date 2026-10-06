import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useAuthContext } from '@/context/context';
import { SOCKET_URL } from '@/utils/urls';

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

type PongPayload = {
  ok: boolean;
  timestamp: number;
};

type SocketContextValue = {
  socket: Socket | null;
  status: SocketStatus;
  error: string | null;
  lastPong: PongPayload | null;
  sendPing: () => void;
  isAuthenticated: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

/**
 * Crea UN solo socket por sesión autenticada y lo comparte con toda la app.
 * Antes, cada componente que llamaba a useSocket() (useMatchmaking, useGameSync...)
 * abría su propio socket y lo cerraba al desmontarse, y el servidor interpretaba
 * ese cierre como que el usuario se había ido.
 *
 * Montar <SocketProvider> una sola vez, dentro del provider de autenticación.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastPong, setLastPong] = useState<PongPayload | null>(null);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('idle');
      setError(null);
      setLastPong(null);
      return;
    }

    const nextSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    nextSocket.on('connect', () => {
      setStatus('connected');
      setError(null);
    });
    nextSocket.on('disconnect', () => setStatus('disconnected'));
    nextSocket.io.on('reconnect_attempt', () => setStatus('reconnecting'));
    nextSocket.on('connect_error', (socketError: Error) => {
      setStatus('error');
      setError(socketError.message);
    });
    nextSocket.on('pong', (payload: PongPayload) => setLastPong(payload));

    setStatus('connecting');
    nextSocket.connect();
    setSocket(nextSocket);

    // Solo se desconecta al cerrar sesión o al desmontar el provider (raíz de la app).
    return () => {
      nextSocket.removeAllListeners();
      nextSocket.disconnect();
      setSocket(null);
      setStatus('idle');
    };
  }, [isAuthenticated]);

  const sendPing = () => {
    socket?.emit('ping');
  };

  return (
    <SocketContext.Provider value={{ socket, status, error, lastPong, sendPing, isAuthenticated }}>
      {children}
    </SocketContext.Provider>
  );
}

// Misma firma de retorno que antes: useMatchmaking y useGameSync no necesitan cambios en cómo lo llaman.
export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de <SocketProvider>');
  }
  return context;
}