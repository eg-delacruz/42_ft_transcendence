import { Link } from "react-router-dom";
import { preload } from 'react-dom';

function Home ()
{
	preload("/game01.jpg", {as: "image"});
	preload("/game02.png", {as: "image"});
	preload("/game03.jpg", {as: "image"});
	preload("/icon01.jpeg", {as: "image"});
	preload("/icon02.jpeg", {as: "image"});
	preload("/icon03.jpeg", {as: "image"});
	preload("/icon04.jpeg", {as: "image"});
	preload("/icon05.jpeg", {as: "image"});

    return (

		<div className="h-screen">
				<div className="relative w-full h-1/3 flex items-center justify-center border-b-8 border-b-slate-200 overflow-hidden">
					{/*marquee*/}
					<div className="absolute inset-0 overflow-hidden bg-slate-200">
						<div className="flex w-screen h-full gap-4">
							<div className="w-1/3 h-full marquee-item bg-[url(/game01.jpg)]">
								Item 1
							</div>
							<div className="w-1/3 h-full marquee-item bg-[url(/game02.png)]">
								Item 2
							</div>
							<div className="w-1/3 h-full marquee-item bg-[url(/game03.jpg)]">
								Item 3
							</div>
						</div>
					</div>
					<div>
						<div className="absolute inset-0 z-10 bg-black opacity-50 pointer-events-none"></div>
					</div>
					{/*title*/}
					<div className="relative z-20 font-pressstart">
						<p className="text-4xl text-slate-100 lg:text-8xl text-shadow-lg text-shadow-slate-400">FT_TRANSCENDENCE</p>
					</div>
				</div>
			<div className="h-2/3 bg-linear-to-t from-slate-800 to-slate-900 relative">
				<div className="absolute inset-0 bg-[url(/tomobgrepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0"></div>
				<div className="relative w-full h-3/5 flex flex-col items-center justify-center">
					<div className=" text-slate-300 text-center text-3xl">
						<p>[DESCRIPTION EXAMPLE]</p>
						<p>A self-hosted minigame webpage, made as part of the 42 curriculum</p>
					</div>
					<div className="p-8 gap-8 flex flex-col lg:flex-row text-2xl font-bold">
						<a className="p-8 px-12 rounded-md text-center text-slate-800 bg-slate-300 transition duration-300 ease-out hover:bg-slate-400 hover:text-slate-900 hover:scale-110 focus:outline-1" href="/login">
							<p>Login</p>
						</a>
						<a className="p-8 px-12 rounded-md text-center text-slate-800 bg-slate-300 transition duration-300 ease-out hover:bg-slate-400 hover:text-slate-900 hover:scale-110 focus:outline-1" href="/register">
							<p>Register</p>
						</a>
					</div>
				</div>
				{/*CREDITS*/}
				<div className="relative w-full flex flex-col items-center justify-center">
					<p className="text-lg text-slate-200 opacity-80 font-bold">MADE BY</p>
					<div className="p-4 gap-2 w-full lg:w-4/5 2xl:w-3/5 flex lg:flex-row flex-wrap justify-around items-center">
						<div className="credit-icon bg-[url(/icon01.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon02.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon03.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon04.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon05.jpeg)]"></div>
					</div>
					<img className="h-12 w-12" src="/github.svg"></img>
				</div>
			</div>
		</div>
    );
}

export default Home;

/**
 *  Home page
 */