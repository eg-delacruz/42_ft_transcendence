import { Link } from "react-router-dom";
import { preload } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

function Home ()
{
    return (
		<div className="h-screen relative">
				<div className="relative w-full h-1/3 flex items-center justify-center border-b-8 border-b-slate-200 overflow-hidden">
					{/*Banner*/}
					<div className="absolute inset-0 overflow-hidden bg-slate-200">
						<div className="flex w-screen h-full gap-0 lg:gap-4">
							<div className="w-1/3 h-full marquee-item bg-[url(/game01.jpg)]" aria-hidden="true"></div>
							<div className="w-1/3 h-full marquee-item bg-[url(/game02.png)]" aria-hidden="true"></div>
							<div className="w-1/3 h-full marquee-item bg-[url(/game03.jpg)]" aria-hidden="true"></div>
						</div>
					</div>
					{/*Black screen*/}
					<div>
						<div className="absolute inset-0 z-10 bg-black opacity-50 pointer-events-none"></div>
					</div>
					{/*Title*/}
					<div className="relative z-20 font-pressstart">
						<p className="text-xl sm:text-3xl lg:text-6xl text-slate-100 text-shadow-lg text-shadow-slate-400">FT_TRANSCENDENCE</p>
					</div>
				</div>
			{/* Background and descrition */} {/* In mobile having h-2/3 and h-screen is perfect bu */}
			<div className="relative w-full h-2/3 bg-linear-to-t from-(--gradient-dark) to-(--gradient-light) overflow-auto">
				<div className="absolute h-screen sm:h-full inset-0 bg-[url(/arcadePatternRepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0" aria-hidden="true"></div>
				<div className="relative w-full p-6 lg:p-12 sm:gap-8 flex flex-col items-center justify-center">
					<div className=" text-slate-300 text-center text-lg lg:text-3xl font-aldrich wrap-normal">
						<p>[FT_TRANSCENDENCE] is a multiplayer minigames platform where users can compete against each other in real-time. 
							This project is part of the 42 curriculum and demonstrates full-stack web development.</p>
					</div>
					<div className="p-6 gap-4 lg:gap-8 flex flex-col sm:flex-row">
						<Link className="customButton lg:p-6 lg:text-2xl transition ease-out-4 bg-linear-to-t from-amber-500 to-amber-300" to="/login">
							<p>Login</p>
						</Link>
						<Link className="customButton lg:p-6 lg:text-2xl transition ease-out-4 bg-linear-to-t from-amber-500 to-amber-300" to="/register">
							<p>Register</p>
						</Link>
					</div>
				</div>
				{/*Credits*/}
				<div className="relative sm:absolute w-full py-6 flex flex-col items-center justify-center inset-x-0 bottom-0">
					<p className="text-lg text-slate-200 opacity-80 font-bold font-aldrich">MADE BY</p>
					<div className="p-4 gap-2 w-full lg:w-4/5 2xl:w-3/5 flex lg:flex-row flex-wrap justify-around items-center">
					{/* Change div so it is img + name + role */}
						<div className="credit-icon">
							<img src="public/icon01.jpeg" className="aspect-square rounded-sm" alt=""></img>
							<p className="font-aldrich text-neutral-200 font-bold text-uppercase">NAME</p>
							<p className="font-aldrich text-neutral-20">role</p>
						</div>
						<div className="credit-icon">
							<img src="public/icon02.jpeg" className="aspect-square rounded-sm" alt=""></img>
							<p className="font-aldrich text-neutral-200 font-bold text-uppercase">NAME</p>
							<p className="font-aldrich text-neutral-20">role</p>
						</div>
						<div className="credit-icon">
							<img src="public/icon03.jpeg" className="aspect-square rounded-sm" alt=""></img>
							<p className="font-aldrich text-neutral-200 font-bold text-uppercase">NAME</p>
							<p className="font-aldrich text-neutral-20">role</p>
						</div>
						<div className="credit-icon">
							<img src="public/icon04.jpeg" className="aspect-square rounded-sm" alt=""></img>
							<p className="font-aldrich text-neutral-200 font-bold text-uppercase">NAME</p>
							<p className="font-aldrich text-neutral-20">role</p>
						</div>
						<div className="credit-icon">
							<img src="public/icon05.jpeg" className="aspect-square rounded-sm" alt=""></img>
							<p className="font-aldrich text-neutral-200 font-bold text-uppercase">NAME</p>
							<p className="font-aldrich text-neutral-20">role</p>
						</div>
					</div>
					<Link to="https://github.com/eg-delacruz/42_ft_transcendence">
						<FontAwesomeIcon icon={faGithub} className="text-white text-4xl"/>
					</Link>
				</div>
			</div>
		</div>
    );
}

export default Home;

/**
 *  Home page
 */