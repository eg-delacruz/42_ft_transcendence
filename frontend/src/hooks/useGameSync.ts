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

    socket.on('game:action', handleRemoteAction);
    socket.on('game:state', handleRemoteState);
    socket.emit('game:join', { roomId: 'global', game });

    return () => {
      socket.off('game:action', handleRemoteAction);
      socket.off('game:state', handleRemoteState);
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
