import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useMatchmaking, type MatchmakingLog } from "@/hooks/useMatchmaking";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useNavigate } from "react-router-dom";
import { MinigamesDevPage } from "../minigames/MinigamesDevPage";
import { TopScores } from '../minigames/components/TopScores';
import { MinigameProvider, useMinigameContext } from "../minigames/context/minigameContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next';
import { SocketDebug } from "./Chat";

function formatMatchPlayersLabel(matchData?: { players?: { userId: string; username: string; role: string }[]; spectators?: string[] }) {
    if (!matchData?.players?.length) return 'Sin jugadores';

    const players = matchData.players.map((player) => ({
        ...player,
        label: player.role === 'player1' ? 'Jugador 1' : player.role === 'player2' ? 'Jugador 2' : player.role === 'solo' ? 'Jugador solo' : 'Espectador',
    }));

    const ordered = [...players].sort((a, b) => {
        const order = { player1: 0, player2: 1, solo: 2, spectator: 3 } as Record<string, number>;
        return (order[a.role] ?? 99) - (order[b.role] ?? 99);
    });

    const playerSummary = ordered
        .filter((player) => player.role === 'player1' || player.role === 'player2' || player.role === 'solo')
        .map((player) => `${player.label}: ${player.username}`)
        .join(' • ');

    const spectators = (matchData.spectators ?? []).length
        ? ` • Espectadores: ${(matchData.spectators ?? []).join(', ')}`
        : '';

    return `${playerSummary}${spectators}`;
}

function GameRoomContent() {
    const { user, loading, error } = useUser();
    const { logout } = useAuthContext();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { activeGame } = useMinigameContext();

    // Hook de Matchmaking creado en el Punto 3
    const { inQueue, matchData, logs, leaveQueue } = useMatchmaking();

    const displayName = user?.username?.trim() ? user.username : "Anonymous";
    const avatarUrl = user?.avatarUrl?.trim() ? user.avatarUrl : "/game01.jpg";

    if (loading) return <div>{t("user.loading")}</div>;
    if (error) return <div>{t("user.error", {message: error})}</div>;
    if (!user) return <div>{t("user.notAuthenticated")}</div>;

    const Logout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="w-screen h-screen flex flex-row items-start bg-linear-to-br from-(--gradient-dark) to-(--gradient-light) relative">
            {/* Game screen */}
            <div className="w-2/3 h-full border-r-6 border-amber-100 hidden lg:block">
                <MinigamesDevPage matchGame={matchData?.game} matchRole={matchData?.role} matchData={matchData} />
                
                {/* Panel / Banner de Matchmaking en la parte del Juego */}
                <div className="p-4 bg-slate-900/80 border-t-2 border-amber-100 flex items-center justify-between text-white font-aldrich">
                    {matchData ? (
                        <div className="flex items-center space-x-4">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                            <div className="flex flex-col">
                                <p className="text-lg text-green-400">
                                    {matchData.role === 'spectator' ? 'Espectador' : 'Partida encontrada'}: {matchData.game}
                                </p>
                                <p className="text-[11px] text-amber-200">
                                    {formatMatchPlayersLabel(matchData)}
                                </p>
                            </div>
                        </div>
                    ) : inQueue ? (
                        <div className="flex items-center space-x-4">
                            <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                            <p className="text-lg text-amber-200">Buscando oponente...</p>
                            <button 
                                onClick={leaveQueue}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <p className="text-slate-300 text-sm">Entrando en la sala global...</p>
                        </div>
                    )}
                    {logs.length > 0 && (
                        <div className="ml-4 max-w-xl overflow-hidden text-xs text-slate-400">
                            {logs.slice(0, 2).map((log: MatchmakingLog) => {
                                const details = log.details as { player1?: string; player2?: string; players?: Array<{ userId: string; username?: string; role: string }>; spectators?: string[] } | undefined;
                                const player1 = details?.player1 ?? details?.players?.find((player) => player.role === 'player1')?.username;
                                const player2 = details?.player2 ?? details?.players?.find((player) => player.role === 'player2')?.username;
                                const spectators = details?.spectators?.join(', ') ?? '';

                                const label = player1 && player2
                                    ? `Jugador 1: ${player1} | Jugador 2: ${player2}${spectators ? ` | Espectadores: ${spectators}` : ''}`
                                    : log.message;

                                return <p key={`${log.timestamp}-${log.message}`}>{label}</p>;
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bets and chat column */}
           <div className="w-full lg:w-1/3 h-full">
				<div className="h-1/9 w-full flex flex-row items-center bg-slate-900/70">
					<div className="w-1/2 mx-auto flex flex-row items-center p-4">
						<div className="size-20 aspect-square overflow-hidden rounded-full outline-4 outline-slate-300">
							<img src={avatarUrl} alt="user avatar" className="block h-full w-full object-cover"></img>
						</div>
						{/*Display name should be a variable*/}
						<div className="ml-8 text-lg lg:text-2xl mx-auto font-pressstart text-slate-200">
							<p>{displayName}</p>
						</div>
					</div>
					<div className="w-1/2 mx-auto flex flex-row items-center p-4 justify-end gap-4">
						<div className="flex flex-col gap-1">
							<button onClick={() => i18n.changeLanguage("es")} className="customButton text-xs p-2">ES</button>
							<button onClick={() => i18n.changeLanguage("en")} className="customButton text-xs p-2">EN</button>
							<button onClick={() => i18n.changeLanguage("en")} className="customButton text-xs p-2">EN</button>
						</div>
						<Menu as="div" className="size-10">
							<MenuButton className="h-full w-full items-center justify-center">
								<div aria-hidden="true" className="">
									<FontAwesomeIcon icon={faGear} className="text-white text-4xl"/>
								</div>
							</MenuButton>	
							<MenuItems
								transition
								className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-slate-900/60 outline-3 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
								<div className="py-1">
								<MenuItem>
									<a
									href="/user"
									className="block px-4 py-2 text-lg lg:text-2xl font-aldrich text-gray-300"
									>
									{t("user.settings")}
									</a>
								</MenuItem>
								<form onClick={Logout}>
									<MenuItem>
									<button
										type="submit"
										className="block w-full px-4 py-2 text-left text-lg lg:text-2xl font-aldrich text-gray-300"
									>
									{t("user.logout")}
									</button>
									</MenuItem>
								</form>
								</div>
							</MenuItems>
						</Menu>
					</div>
				</div>
				<div className="h-1/9 p-4 w-full flex flex-col items-center border-b-6 border-amber-100">

					<div className="h-full w-full bg-slate-900 opacity-70">
						{/* Scores component */}
                        {activeGame ? <TopScores minigameId={activeGame} currentPlayers={matchData?.players} /> : null}
					</div>
				</div>
				<div className="h-7/9 p-4 w-full flex flex-col items-center bg-slate-900 opacity-70">
					<h2 className="text-center font-aldrich font-bold text-xl text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-500">CHAT</h2>
					<div className="h-9/10 w-full m-4 overflow-hidden">
                        <SocketDebug />
					</div>
				</div>
			</div>
        </div>
    );
}


function GameRoom() {
    return (
        <MinigameProvider>
            <GameRoomContent />
        </MinigameProvider>
    );
}

export default GameRoom;    