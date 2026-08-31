import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useNavigate } from "react-router-dom";
// import { MinigamesDevPage } from "../minigames/MinigamesDevPage"

//Using the user page conf here because it is related I guess

function Game() {
    const { user, loading, error } = useUser();
    const { logout, deleteAccount } = useAuthContext();
	const navigate = useNavigate();

	const displayName =
		user?.display_name?.trim() ? user.display_name : "Anonymous";

	const avatarUrl =
		user?.avatar_url?.trim() ? user.avatar_url : "/game01.jpg";

    if (loading) 
		return <div>Loading User...</div>;
    if (error) 
		return <div>Error: {error}</div>;
    if (!user) 
		return <div>Not authenticated user.</div>;

	const Logout = () => 
	{
  		logout();
  		navigate("/");
	};

    return (
        <div className="w-screen h-screen flex flex-row items-start bg-linear-to-br from-(--gradient-dark) to-(--gradient-light) relative">
			{/* Game screen */}
			<div className="w-0 lg:w-2/3 h-full lg:border-r-6 lg:border-amber-100">
				{/*Game component*/}
				{/* <MinigamesDevPage ></MinigamesDevPage> */}
			</div>
			{/* Bets and chat column */}
			<div className="w-full lg:w-1/3 h-full">
				<div className="h-1/9 w-full grid grid-cols-6 items-center bg-slate-900/70">
					{/*Color outline should be a variable*/}
					<div className="col-start-1 h-2/3 ml-4 rounded-full aspect-square outline-4 outline-slate-300">
						<img src={avatarUrl} alt="user avatar" className="h-full w-full object-cover"></img>
					</div>
					{/*Display name should be a variable*/}
					<div className="col-start-2 col-end-5 ml-8 text-lg lg:text-2xl font-pressstart text-slate-200">
						<p>{displayName}</p>
					</div>
					<Menu as="div" className="col-start-6 size-10 top-0 mr-0">
						<MenuButton className="h-full w-full items-center justify-center">
							<div aria-hidden="true" className="text-gray-400">
								<img src="/gear-solid-full.svg"></img>
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
								Account settings
								</a>
							</MenuItem>
							{/*No etsoy segura de que esto esté bien siendo un form con post pero es codigo externo asi que ni idea*/}
							<form onClick={Logout} method="POST">
								<MenuItem>
								<button
									type="submit"
									className="block w-full px-4 py-2 text-left text-lg lg:text-2xl font-aldrich text-gray-300"
								>
									Log out
								</button>
								</MenuItem>
							</form>
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
    )
}

export default Game;