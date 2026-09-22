import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { TermsOfService } from '@/pages/TermsOfService';

function Home ()
{
	const [showPrivacy, setShowPrivacy] = useState(false);
	const [showTerms, setShowTerms] = useState(false);
	const { t, i18n } = useTranslation();

	const handlePrivacy = () => setShowPrivacy(true);
	const handleTerms = () => setShowTerms(true);

    return (
		<div className="h-screen relative flex flex-col">
				<div className="relative w-full h-1/3 flex items-center justify-center border-b-8 border-b-slate-200 overflow-hidden">

					{/*Banner*/}
					<div className="absolute inset-0 overflow-hidden bg-slate-200">
						<div className="flex w-screen h-full gap-0 lg:gap-4">
							<div className="w-1/3 h-full marquee-item bg-[url(/race-thumbnail.png)] bg-cover bg-bottom " aria-hidden="true"></div>
							<div className="w-1/3 h-full marquee-item bg-[url(/fight-thumbnail.png)] bg-cover bg-center " aria-hidden="true"></div>
							<div className="w-1/3 h-full marquee-item bg-[url(/ddd-thumbnail.png)] bg-cover bg-top " aria-hidden="true"></div>
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

			{/* Background and description */}
			<div className="relative w-full h-2/3 flex-1 bg-linear-to-t from-(--gradient-dark) to-(--gradient-light)"> {/*overflow-scroll*/}
				<div className="fixed h-full w-screen inset-0 bg-[url(/arcadePatternRepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0" aria-hidden="true"></div>
				<div className="relative w-full p-6 lg:p-12 sm:gap-8 flex flex-col items-center justify-center ">{/*overflow-scroll*/}
					<div className=" text-slate-300 text-center text-lg lg:text-3xl font-aldrich wrap-normal">
						<p>[FT_TRANSCENDENCE] is a multiplayer minigames platform where users can compete against each other in real-time. 
							This project is part of the 42 curriculum and demonstrates full-stack web development.</p>
					</div>
					<button onClick={() => i18n.changeLanguage("es")}>ES</button>
					<button onClick={() => i18n.changeLanguage("en")}>EN</button>
					<div className="p-6 gap-4 lg:gap-8 flex flex-col sm:flex-row">
						<Link className="customButton lg:p-6 lg:text-2xl transition ease-out-4 bg-linear-to-t from-amber-500 to-amber-300" to="/login">
							<p>{t("login.button")}</p>
						</Link>
						<Link className="customButton lg:p-6 lg:text-2xl transition ease-out-4 bg-linear-to-t from-amber-500 to-amber-300" to="/register">
							<p>{t("register.button")}</p>
						</Link>
					</div>
				</div>

				{/*Credits*/}
				<div className="relative w-full py-6 flex flex-col items-center justify-center">
					<p className="text-lg text-slate-200 opacity-80 font-bold font-aldrich">MADE BY</p>
					<div className="p-4 gap-2 w-full lg:w-4/5 2xl:w-3/5 flex lg:flex-row flex-wrap justify-around items-center">
						<div className="credit-icon">
							<Link to="https://github.com/pexpalacios">
								<img src="https://avatars.githubusercontent.com/u/184498220" className="w-full aspect-square rounded-sm object-cover" alt="icon of @pexpalacios on github"></img>
							</Link>
							<p className="font-aldrich font-bold text-uppercase">@pexpalacios</p>
							<p className="font-aldrich text-neutral-20">frontend</p>
						</div>
						<div className="credit-icon">
							<Link to="https://github.com/jfercode">
								<img src="https://avatars.githubusercontent.com/u/102600920" className="w-full aspect-square rounded-sm object-cover" alt="icon of @jfercode on github"></img>
							</Link>
							<p className="font-aldrich font-bold text-uppercase">@jfercode</p>
							<p className="font-aldrich text-neutral-20">backend</p>
						</div>
						<div className="credit-icon">
							<Link to="https://github.com/eg-delacruz">
								<img src="https://avatars.githubusercontent.com/u/47685237" className="w-full aspect-square rounded-sm object-cover" alt="icon of @eg-delacruz on github"></img>
							</Link>
							<p className="font-aldrich font-bold text-uppercase">@eg-delacruz</p>
							<p className="font-aldrich text-neutral-20">backend</p>
						</div>
						<div className="credit-icon">
							<Link to="https://github.com/ZTerto">
								<img src="https://avatars.githubusercontent.com/u/178986190" className="w-full aspect-square rounded-sm object-cover" alt="icon of @ZTerto on github"></img>
							</Link>
							<p className="font-aldrich font-bold text-uppercase">@ZTerto</p>
							<p className="font-aldrich text-neutral-20">frontend</p>
						</div>
						<div className="credit-icon">
							<Link to="https://github.com/Davidfdzd">
								<img src="https://avatars.githubusercontent.com/u/182209667" className="w-full aspect-square rounded-sm object-cover" alt="icon of @Davidfdzd on github"></img>
							</Link>
							<p className="font-aldrich font-bold text-uppercase">@Davidfdzd</p>
							<p className="font-aldrich text-neutral-20">backend</p>
						</div>
					</div>
					<label htmlFor="giticon" className="labelCustom p-2">see repo on github</label>
					<Link to="https://github.com/eg-delacruz/42_ft_transcendence" id="giticon">
						<FontAwesomeIcon icon={faGithub} className="text-white text-4xl"/>
					</Link>
				</div>
			</div>
			{/*Políticas y Términos */}
			<footer className="w-full flex flex-col sm:flex-row justify-between items-center text-center text-sm font-aldrich border-t pt-6  text-slate-500 bg-(--gradient-dark)">
				<div>
					ft_transcendence &copy; {new Date().getFullYear()} — Proyecto 42
				</div>
				<div className="flex items-center gap-4 mr-2">
					<button onClick={handlePrivacy} className="hover:text-slate-300 transition-colors">
						Política de Privacidad
					</button>
					{showPrivacy && (
						<div className="absolute inset-0 flex flex-col items-center justify-center z-50 animate-appear bg-black/60">
							<PrivacyPolicy></PrivacyPolicy>
							<button onClick={() => setShowPrivacy(false)} className="customButton mt-5">BACK</button>
						</div>
					)}
				<span>•</span>
					<button onClick={handleTerms} className="hover:text-slate-300 transition-colors">
						Términos del Servicio
					</button>
					{showTerms && (
						<div className="absolute inset-0 flex flex-col items-center justify-center z-50 animate-appear bg-black/60">
							<TermsOfService></TermsOfService>
							<button onClick={() => setShowTerms(false)} className="customButton mt-5">BACK</button>
						</div>
					)}
				</div>
			</footer>
		</div>
    );
}

export default Home;