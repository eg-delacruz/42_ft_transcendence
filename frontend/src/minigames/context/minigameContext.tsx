import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { MinigameId } from '../types';

type MinigameContextValue = {
  activeGame: MinigameId | null;
  setActiveGame: (id: MinigameId | null) => void;
};

const MinigameContext = createContext<MinigameContextValue | undefined>(undefined);

export function MinigameProvider({ children }: { children: ReactNode }) {
  const [activeGame, setActiveGame] = useState<MinigameId | null>(null);

  const value = useMemo(() => ({ activeGame, setActiveGame }), [activeGame]);

  return (
    <MinigameContext.Provider value={value}>
      {children}
    </MinigameContext.Provider>
  );
}

export function useMinigameContext() {
  const ctx = useContext(MinigameContext);
  if (!ctx) {
    throw new Error('useMinigameContext must be used within a MinigameProvider');
  }
  return ctx;
}