import { Link } from "react-router-dom";
import { preload } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

function Home ()
{
	console.log(window.innerWidth, window.innerHeight, window.devicePixelRatio);
	console.log(getComputedStyle(document.documentElement).fontSize, document.documentElement.clientWidth);
	console.log('>=1536px?', window.matchMedia('(min-width:1536px)').matches);
	console.log('>=1920px?', window.matchMedia('(min-width:1920px)').matches);
    return (
		<div className="h-screen relative">
				<div className="relative w-full h-1/3 flex items-center justify-center border-b-8 border-b-slate-200 overflow-hidden">
					{/*Banner*/}
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
					{/*Black screen*/}
					<div>
						<div className="absolute inset-0 z-10 bg-black opacity-50 pointer-events-none"></div>
					</div>
					{/*Title*/}
					<div className="relative z-20 font-pressstart">
						<p className="text-2xl lg:text-8xl text-slate-100 text-shadow-lg text-shadow-slate-400">FT_TRANSCENDENCE</p>
					</div>
				</div>
			{/* Background and descrition */}
			<div className="relative w-full bg-linear-to-t from-(--gradient-dark) to-(--gradient-light) overflow-auto pb-70 md:pb-auto">
				<div className="absolute inset-0 bg-[url(/arcadePatternRepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0" aria-hidden="true"></div>
				<div className="relative w-full p-6 lg:p-12 flex flex-col items-center justify-center">
					<div className=" text-slate-300 text-center text-lg lg:text-3xl font-aldrich wrap-normal">
						<p>[DESCRIPTION EXAMPLE]</p>
						<p>A self-hosted minigame webpage, made as part of the 42 curriculum</p>
					</div>
					<div className="p-6 gap-4 lg:gap-8 flex flex-col md:flex-row">
						<Link className="customButton lg:p-6 lg:text-2xl transition ease-out-4 bg-linear-to-t from-amber-500 to-amber-300" to="/login">
							<p>Login</p>
						</Link>
						<Link className="customButton lg:p-6 lg:text-2xl transition ease-out-4 bg-linear-to-t from-amber-500 to-amber-300" to="/register">
							<p>Register</p>
						</Link>
					</div>
				</div>
				{/*Credits*/}
				<div className="relative w-full flex flex-col items-center justify-center">
					<p className="text-lg text-slate-200 opacity-80 font-bold font-aldrich">MADE BY</p>
					<div className="p-4 gap-2 w-full lg:w-4/5 2xl:w-3/5 flex lg:flex-row flex-wrap justify-around items-center">
						<div className="credit-icon bg-[url(/icon01.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon02.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon03.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon04.jpeg)]"></div>
						<div className="credit-icon bg-[url(/icon05.jpeg)]"></div>
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