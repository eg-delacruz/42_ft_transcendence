import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useNavigate } from "react-router-dom";
import { MinigamesDevPage } from "../minigames/MinigamesDevPage";

function GameRoom() {
    const { user, loading, error } = useUser();
    const { logout } = useAuthContext();
    const navigate = useNavigate();

    // Hook de Matchmaking creado en el Punto 3
    const { inQueue, matchData, joinQueue, leaveQueue } = useMatchmaking();

    const displayName = user?.display_name?.trim() ? user.display_name : "Anonymous";
    const avatarUrl = user?.avatar_url?.trim() ? user.avatar_url : "/game01.jpg";

    if (loading) return <div>Loading User...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>Not authenticated user.</div>;

    const Logout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="w-screen h-screen flex flex-row items-start bg-linear-to-br from-(--gradient-dark) to-(--gradient-light) relative">
            {/* Game screen */}
            <div className="w-0 lg:w-2/3 h-full lg:border-r-6 lg:border-amber-100 flex flex-col justify-between">
                <MinigamesDevPage />
                
                {/* Panel / Banner de Matchmaking en la parte del Juego */}
                <div className="p-4 bg-slate-900/80 border-t-2 border-amber-100 flex items-center justify-between text-white font-aldrich">
                    {matchData ? (
                        <div className="flex items-center space-x-4">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                            <p className="text-lg text-green-400">
                                ¡Partida encontrada! Sala: <span className="font-mono text-amber-300">{matchData.roomId}</span>
                            </p>
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
                            <p className="text-slate-300 text-sm">¿Listo para jugar?</p>
                            <button 
                                onClick={joinQueue}
                                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded shadow-lg transition-transform hover:scale-105 cursor-pointer font-pressstart text-xs"
                            >
                                BUSCAR PARTIDA
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bets and chat column */}
            <div className="w-full lg:w-1/3 h-full">
                <div className="h-1/9 w-full grid grid-cols-6 items-center bg-slate-900/70">
                    <div className="col-start-1 h-2/3 ml-4 rounded-full aspect-square outline-4 outline-slate-300">
                        <img src={avatarUrl} alt="user avatar" className="h-full w-full object-cover rounded-full" />
                    </div>
                    <div className="col-start-2 col-end-5 ml-8 text-lg lg:text-2xl font-pressstart text-slate-200">
                        <p>{displayName}</p>
                    </div>
                    <Menu as="div" className="col-start-6 size-10 top-0 mr-0">
                        <MenuButton className="h-full w-full items-center justify-center cursor-pointer">
                            <div aria-hidden="true" className="text-gray-400">
                                <img src="/gear-solid-full.svg" alt="settings" />
                            </div>
                        </MenuButton>   
                        <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-slate-900/60 outline-3 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                        >
                            <div className="py-1">
                                <MenuItem>
                                    <a
                                        href="/user"
                                        className="block px-4 py-2 text-lg lg:text-2xl font-aldrich text-gray-300 hover:bg-slate-800"
                                    >
                                        Account settings
                                    </a>
                                </MenuItem>
                                <MenuItem>
                                    <button
                                        type="button"
                                        onClick={Logout}
                                        className="block w-full px-4 py-2 text-left text-lg lg:text-2xl font-aldrich text-gray-300 hover:bg-slate-800 cursor-pointer"
                                    >
                                        Log out
                                    </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Menu>
                </div>

                <div className="h-4/9 p-8 w-full flex flex-col items-center border-b-6 border-amber-100">
                    <h2 className="text-center font-aldrich font-bold text-4xl text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-500">BETS</h2>
                    <div className="h-full w-full m-4 bg-slate-900 opacity-20">
                        {/* Bets component */}
                    </div>
                </div>

                <div className="h-4/9 p-8 w-full flex flex-col items-center">
                    <h2 className="text-center font-aldrich font-bold text-4xl text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-500">CHAT</h2>
                    <div className="h-full w-full m-4 bg-slate-900 opacity-20">
                        {/* Chat component */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameRoom;