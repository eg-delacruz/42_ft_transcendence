import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useState, useCallback } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useNavigate } from "react-router-dom";
import { MinigamesDevPage } from "../minigames/MinigamesDevPage";
import { SocketDebug } from "./Chat";
import { TopScores } from '../minigames/components/TopScores';
import type { MinigameId } from "../minigames/types";
import { MinigameProvider, useMinigameContext } from "../minigames/context/minigameContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next';

function GameRoomContent() {
    const { user, loading, error } = useUser();
    const { logout, deleteAccount } = useAuthContext();
	const { activeGame } = useMinigameContext();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();

	const displayName =
		user?.username?.trim() ? user.username : "Anonymous";

	const avatarUrl =
		user?.avatarUrl?.trim() ? user.avatarUrl : "/defaultavatar.png";

    if (loading) 
		return <div>{t("user.loading")}</div>;
    if (error) 
		return <div>{t("user.error", {message: error})}</div>;
    if (!user) 
		return <div>{t("user.notAuthenticated")}</div>;

	const Logout = () => 
	{
  		logout();
  		navigate("/");
	};

    return (
        <div className="w-screen h-screen flex flex-row items-start bg-linear-to-br from-(--gradient-dark) to-(--gradient-light) relative">
			{/* Game screen */}
			<div className="w-2/3 h-full border-r-6 border-amber-100 hidden lg:block">
				{/*Game component*/}
				 <MinigamesDevPage />
				{/* <div className="h-full w-full flex items-center justify-center bg-slate-950/30 text-slate-200 font-aldrich text-xl">
					{activeGame ? `Match ready: ${activeGame}` : 'Waiting for match...'}
				</div> */}
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
						{activeGame ? <TopScores minigameId={activeGame} /> : null}
					</div>
				</div>
				<div className="h-7/9 p-4 w-full flex flex-col items-center bg-slate-900 opacity-70">
					<h2 className="text-center font-aldrich font-bold text-xl text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-500">CHAT</h2>
					<div className="h-9/10 w-full m-4 overflow-hidden">
						{/* Chat component */}
						<SocketDebug></SocketDebug>
					</div>
				</div>
			</div>
        </div>
    )
}

function GameRoom() {
    return (
        <MinigameProvider>
            <GameRoomContent />
        </MinigameProvider>
    );
}

export default GameRoom;