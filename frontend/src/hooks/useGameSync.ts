import { useEffect, useRef } from 'react';

import { useSocket } from './useSocket';
import type { MatchGame, MatchRole } from './useMatchmaking';

type GameActionType = 'race_step' | 'fight_select' | 'dungeon_key';

type RemoteGameAction = {
  game: MatchGame;
  type: GameActionType;
  action?: string;
  role: MatchRole;
  userId: string;
};

type RemoteGameState = {
  game: MatchGame;
  state: unknown;
};

export function useGameSync(
  game: MatchGame,
  onRemoteAction: (action: RemoteGameAction) => void,
  onRemoteState?: (state: RemoteGameState) => void,
) {
  const { socket } = useSocket();
  const socketRef = useRef(socket);
  const actionHandlerRef = useRef(onRemoteAction);
  const stateHandlerRef = useRef(onRemoteState);

  socketRef.current = socket;
  actionHandlerRef.current = onRemoteAction;
  stateHandlerRef.current = onRemoteState;

  useEffect(() => {
    if (!socket) return;

    const handleRemoteAction = (action: RemoteGameAction) => {
      if (action.game === game) actionHandlerRef.current(action);
    };
    const handleRemoteState = (state: RemoteGameState) => {
      if (state.game === game) stateHandlerRef.current?.(state);
    };

	const joinGame = (matchGame: MatchGame = game) => {
      socket.emit('game:join', { roomId: 'global', game: matchGame });
    };

    const handleMatchFound = (match: { game?: MatchGame }) => joinGame(match.game ?? game);
    const handleConnect = () => joinGame();

	const handleGameReady = (data: any) => {
		console.info('[game] game:ready recibido', data);
	};

	const handleGameError = (error: any) => {
		console.error('[game] game:error recibido', error);
	};
 
    socket.on('game:action', handleRemoteAction);
    socket.on('game:state', handleRemoteState);
    socket.on('match_found', handleMatchFound);
    socket.on('connect', handleConnect);
	socket.on('game:ready', handleGameReady);
	socket.on('game:error', handleGameError);

    if (socket.connected) 
		joinGame();
 
    return () => {
      socket.off('game:action', handleRemoteAction);
      socket.off('game:state', handleRemoteState);
      socket.off('match_found', handleMatchFound);
      socket.off('connect', handleConnect);
	  socket.off('game:ready', handleGameReady);
	  socket.off('game:error', handleGameError);
    };
  }, [game, socket]);

  function sendAction(type: GameActionType, action?: string) {
    socketRef.current?.emit('game:action', {
      roomId: 'global',
      game,
      type,
      action,
    });
  }

  return { sendAction };
}

export type { RemoteGameAction };
