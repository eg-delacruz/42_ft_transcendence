import { useEffect, useRef, useState } from 'react';
import { TopScores } from '../components/TopScores';
import { updateMinigameTopScore } from '../components/TopScores.api';
import { createInitialRaceState, getPlayerIdFromKey, getProgressPercentage, getRaceWinnerName } from './Race.logic';
import { RACE_PLAYER_1_CONTROL_TEXT, RACE_PLAYER_2_CONTROL_TEXT, RACE_TARGET_SCORE, type RacePlayer, type RaceState } from './Race.types';
import { getRaceDisplayName, getRaceUserId } from './Race.users';
import racePlayerOneGif from '../assets/race-playerone.gif';
import racePlayerTwoGif from '../assets/race-playertwo.gif';
import type { MatchRole } from '@/hooks/useMatchmaking';
import { useGameSync, type RemoteGameAction } from '@/hooks/useGameSync';

type TheRaceProps = {
  onExitToMenu?: () => void;
  playerRole?: MatchRole;
};

export function TheRace({ onExitToMenu, playerRole }: TheRaceProps) {
  const [raceState, setRaceState] = useState<RaceState>(createInitialRaceState);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const hasSubmittedScore = useRef(false);

  const { sendAction } = useGameSync(
    'the_race',
    (_action: RemoteGameAction) => undefined,
    (remoteState) => setRaceState(remoteState.state as RaceState),
  );

  useEffect(() => {
    if (raceState.phase !== 'running') return;
    const intervalId = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [raceState.phase]);

  useEffect(() => {
    if (raceState.phase !== 'finished' || !raceState.winnerId || hasSubmittedScore.current) return;
    const winner = raceState.players.find((player) => player.id === raceState.winnerId);
    if (!winner) return;
    hasSubmittedScore.current = true;
    updateMinigameTopScore('the-race', winner.progress, getRaceUserId(raceState.winnerId)).catch((error) => {
      console.error('Error updating The Race top score:', error);
    });
  }, [raceState.phase, raceState.winnerId, raceState.players]);

  useEffect(() => {
    if (raceState.phase !== 'finished' || raceState.resultsCountdown <= 0) return;
    const timeoutId = window.setTimeout(() => {
      setRaceState((state) => state.phase === 'finished'
        ? { ...state, resultsCountdown: state.resultsCountdown - 1 }
        : state,
      );
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [raceState.phase, raceState.resultsCountdown]);

  useEffect(() => {
    if (raceState.phase === 'finished' && raceState.resultsCountdown <= 0) onExitToMenu?.();
  }, [raceState.phase, raceState.resultsCountdown, onExitToMenu]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;
      const playerId = getPlayerIdFromKey(event.code);
      if (!playerId || (playerRole !== 'player1' && playerRole !== 'player2') || playerId !== playerRole) return;
      event.preventDefault();
      sendAction('race_step');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerRole, sendAction]);

  const player1 = raceState.players[0];
  const player2 = raceState.players[1];
  const winnerName = getRaceWinnerName(raceState);

  return (
    <main className="w-full h-screen flex items-center justify-center p-0 relative overflow-hidden bg-amber-500">
      <TopScores minigameId="the-race" />
      <div className="w-full h-full grid grid-cols-3 overflow-hidden relative">
        <aside className="flex flex-col pt-12 pl-2 pr-2 gap-20 bg-[url(../minigames/assets/race-grass.gif)] bg-repeat">
          <div className="raceBox">
            <span className="basicText text-4xl">◷</span>
            <div className="flex flex-col gap-1">
              <p className="basicText">Tiempo:</p>
              <p className="basicText">{getRaceTimeText(raceState, elapsedSeconds)}</p>
            </div>
          </div>
        </aside>
        <section className="trackArea relative flex flex-col pt-12 pl-2 pr-2 gap-20 bg-[url(../minigames/assets/race-grass.gif)] bg-repeat">
          <RaceStatus raceState={raceState} winnerName={winnerName} />
          <div className="h-full relative flex flex-row items-end justify-center pt-12 pl-2 pr-2 gap-20 overflow-hidden bg-[url(../minigames/assets/race-track.png)] bg-center bg-auto bg-repeat-y">
            <RaceRunner player={player1} />
            <RaceRunner player={player2} />
          </div>
        </section>
        <aside className="flex flex-col pt-12 pl-2 pr-2 gap-20 bg-[url(../minigames/assets/race-grass.gif)] bg-repeat">
          <header className="raceBox"><p className="basicText">Meta - {RACE_TARGET_SCORE}</p></header>
          <div className="grid grid-cols-2 text-center raceBox">
            {raceState.players.map((player) => <p key={player.id} className="basicText text-xs">{getRaceDisplayName(player.id)}: {player.progress}</p>)}
          </div>
        </aside>
        {raceState.phase === 'finished' && (
          <div className="absolute w-100 h-60 flex flex-col items-center justify-center text-center p-2 gap-2 left-1/2 top-1/2 bg-zinc-800/95 rounded-2xl raceFinishedOverlay basicText">
            <h2 className="text-lg">Carrera terminada</h2>
            <p className="text-2xl">Ganador: {winnerName}</p>
            <p className="text-sm">Volviendo al menú en {raceState.resultsCountdown}...</p>
          </div>
        )}
      </div>
    </main>
  );
}

function RaceStatus({ raceState, winnerName }: { raceState: RaceState; winnerName: string }) {
  if (raceState.phase === 'bettingCountdown') return <section className="raceStatusBox raceBox"><h2 className="basicText text-lg">Apuestas</h2><p className="basicText text-2xl">{raceState.bettingCountdown}</p><p className="basicText text-xs">La carrera empezará automáticamente.</p></section>;
  if (raceState.phase === 'gameCountdown') return <section className="raceStatusBox raceBox"><h2 className="basicText text-lg">Preparados</h2><p className="basicText text-2xl">{raceState.gameCountdown}</p><p className="basicText text-xs">Todavía no pulses.</p></section>;
  if (raceState.phase === 'running') return <section className="raceStatusBox raceBox"><h2 className="basicText text-lg">¡Corre!</h2><p className="basicText text-xs">{RACE_PLAYER_1_CONTROL_TEXT} • AVANZAR • {RACE_PLAYER_2_CONTROL_TEXT}</p></section>;
  return <section className="raceStatusBox raceBox"><h2 className="basicText text-lg">Meta</h2><p className="basicText text-md">{winnerName}</p></section>;
}

function RaceRunner({ player }: { player?: RacePlayer }) {
  if (!player) return null;
  const bottom = `${Math.round(getProgressPercentage(player.progress))}%`;
  const isPlayerOne = player.id === 'player1';
  return (
    <div className={isPlayerOne ? 'raceRunner bg-[url(../minigames/assets/race-playerone.gif)] bg-center bg-cover bg-no-repeat left-1/3' : 'raceRunner bg-[url(../minigames/assets/race-playertwo.gif)] bg-center bg-cover bg-no-repeat left-2/3'} style={{ bottom }}>
      <img
        src={isPlayerOne ? racePlayerOneGif : racePlayerTwoGif}
        alt=""
        className="h-20 w-20 object-contain"
      />
    </div>
  );
}

function getRaceTimeText(raceState: RaceState, elapsedSeconds: number): string {
  if (raceState.phase === 'bettingCountdown') return `00:${String(raceState.bettingCountdown).padStart(2, '0')}`;
  if (raceState.phase === 'gameCountdown') return `00:${String(raceState.gameCountdown).padStart(2, '0')}`;
  return formatElapsedTime(elapsedSeconds);
}

function formatElapsedTime(totalSeconds: number): string {
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
