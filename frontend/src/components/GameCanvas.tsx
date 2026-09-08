import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface PlayerPosition {
  x: number;
  y: number;
}

interface PlayersState {
  [socketId: string]: PlayerPosition;
}

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const posRef = useRef<PlayerPosition>({ x: 100, y: 100 });

  useEffect(() => {
    // Conectar al backend de Socket.IO
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Conectado al servidor de WebSockets:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor de WebSockets');
      setIsConnected(false);
    });

    // Escuchar actualizaciones de todos los jugadores y redibujar
    socket.on('stateUpdate', (players: PlayersState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar fondo
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar a cada jugador
      Object.entries(players).forEach(([id, pos]) => {
        const isMe = id === socket.id;

        // Si somos nosotros, pintar en verde; si es otro jugador, en azul
        ctx.fillStyle = isMe ? '#22c55e' : '#3b82f6';
        ctx.fillRect(pos.x, pos.y, 30, 30);

        // Texto con la ID
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(isMe ? 'Tú' : id.substring(0, 5), pos.x, pos.y - 5);
      });
    });

    // Manejar eventos del teclado para mover el jugador
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 10;
      let moved = false;
      const currentPos = { ...posRef.current };

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        currentPos.y = Math.max(0, currentPos.y - step);
        moved = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        currentPos.y = Math.min(470, currentPos.y + step);
        moved = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        currentPos.x = Math.max(0, currentPos.x - step);
        moved = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        currentPos.x = Math.min(770, currentPos.x + step);
        moved = true;
      }

      if (moved) {
        posRef.current = currentPos;
        socket.emit('move', currentPos);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {isConnected ? 'Conectado a Socket.IO' : 'Desconectado'}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="border-2 border-slate-700 rounded-lg shadow-lg bg-slate-900"
      />

      <p className="text-xs text-slate-400">
        Usa las flechas del teclado o <strong>WASD</strong> para moverte.
      </p>
    </div>
  );
};