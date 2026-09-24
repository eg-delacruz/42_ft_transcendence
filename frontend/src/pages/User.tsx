import { useAuthContext } from "@/context/context";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { api } from "@/utils/api";
import { useTranslation } from 'react-i18next';

const avatarOptions = [
	{ src: "/avatar01.png", alt: "Arcade avatar" },
	{ src: "/avatar02.png", alt: "Blue avatar" },
	{ src: "/avatar03.png", alt: "Retro avatar" },
	{ src: "/avatar04.png", alt: "Icon avatar" },
];


function User() {
	const { user, loading, error, logout, deleteAccount, auth } = useAuthContext();
	const navigate = useNavigate();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);
	const [displayName, setDisplayname] = useState(user?.username ?? "");
	const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
	const [isSaving, setIsSaving] = useState(false);
	const { t, i18n } = useTranslation();

	useEffect(() => {
		setDisplayname(user?.username ?? "");
		setAvatarUrl(user?.avatarUrl ?? "");
	}, [user]);

	const handleLogout = () => setShowLogoutConfirm(true);
	const handleDelete = () => setShowDeleteConfirm(true);

	const confirmLogout = () => {
		logout();
		navigate("/");
		setShowLogoutConfirm(false);
	};

	const confirmDelete = () => {
		deleteAccount();
		navigate("/");
		setShowDeleteConfirm(false);
	};

	const backToGameBttn = () => {
		navigate("/gameroom");
	};

	const changeUser = async (changes?: { displayName?: string; avatarUrl?: string }) => {
		if (!user)
			return;

		const update: Record<string, string> = {};

		if (changes?.displayName !== undefined) {
			update.username = changes.displayName;
		}

		if (changes?.avatarUrl !== undefined) {
			update.avatarUrl = changes.avatarUrl;
		}

		if (Object.keys(update).length === 0) {
			return;
		}

		setIsSaving(true);
		try {
			const response = await api.patch(`/users/update/${user._id || user.id}`, update);
			const updatedUser = response.body?.body ?? response.body?.user ?? response.body;

			if (updatedUser?.username !== undefined) {
				setDisplayname(updatedUser.username);
			}
			if (updatedUser?.avatarUrl !== undefined) {
				setAvatarUrl(updatedUser.avatarUrl);
			}

			await auth();
			setShowAvatarPicker(false);
		} finally {
			setIsSaving(false);
		}
	};

    if (loading) 
		return <div>{t("user.loading")}</div>;
    if (error) 
		return <div>{t("user.error", { error })}</div>;
    if (!user) 
		return <div>{t("user.notAuthenticated")}</div>;

    return (
        <div id="userPageContainer" className="h-screen w-screen p-8 gap-12 flex flex-col items-center bg-linear-to-t from-(--gradient-dark) to-(--gradient-light)">
			<div className="absolute inset-0 bg-[url(/arcadePatternRepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0" aria-hidden="true"></div>
			{showAvatarPicker && (
				<div className="absolute inset-0 z-50 flex items-start justify-center bg-black/60 pt-24">
					<div className="w-[min(92vw,30rem)] rounded-3xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-md">
						<div className="mb-4 flex items-center justify-between">
							<p className="font-aldrich text-2xl text-slate-100">{t("user.banner.changePfp")}</p>
							<button
								type="button"
								onClick={() => setShowAvatarPicker(false)}
								className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100 hover:bg-white/20"
							>
								{t("common.close")}
							</button>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{avatarOptions.map((option) => (
								<button
									key={option.src}
									type="button"
									onClick={() => changeUser({ avatarUrl: option.src })}
									disabled={isSaving}
									className={`overflow-hidden rounded-2xl border-2 transition hover:scale-[1.02] ${avatarUrl === option.src ? "border-amber-300" : "border-white/10"}`}
								>
									<img src={option.src} alt={option.alt} className="h-32 w-full object-cover" />
									<div className="bg-slate-900/80 px-3 py-2 text-left text-sm text-slate-100">
										{option.alt}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
			{/* Top part / banner */}
			<div id="userBanner" className="relative min-h-1/3 h-fit w-full flex flex-row bg-(--gradient-light) shadow-2xs rounded-4xl items-center justify-center overflow-auto">
				<div className="w-1/4 flex flex-col items-center justify-center p-4">
					<div className="relative h-50 md:h-full aspect-square overflow-hidden rounded-full outline-4 outline-slate-300 shadow-md flex items-end justify-end">
						<img src={avatarUrl || "/defaultAvatar.png"} alt="User avatar" className="h-full w-full object-cover" />
					</div>
					<button
						id="changeProfilePic"
						type="button"
						onClick={() => setShowAvatarPicker(true)}
						className="absolute h-12 w-12 bg-black/50 rounded-sm bottom-2 right-2 flex items-center justify-center text-white text-xl">
							<FontAwesomeIcon icon={faPenToSquare}/>
					</button>
					<label htmlFor="changeProfilePic" className="labelCustom">{t("user.avatarPicker.title")}</label>	
				</div>
				<div className="w-auto flex flex-col lg:flex-row">
					<div className="w-full p-6 flex items-center gap-4 text-left font-aldrich text-md text-slate-200">
						<div className="outline-none w-full">
							<label className="labelCustom"> {t("user.banner.displayName")} 
							<input
								className="w-full p-4 arcadeform flex-1"
								type="text"
								value={displayName}
								id="displayName"
								onChange={(e) => setDisplayname(e.target.value)}
								placeholder="display"
							/></label>
						</div>
						{/* Button to change display name. */}
						<button id="changeDisplayName" type="button" onClick={() => changeUser({ displayName })} disabled={isSaving} className="h-14 w-14 flex items-center justify-center bg-black/50 rounded-sm text-white text-2xl">
							<FontAwesomeIcon className="" icon={faArrowsRotate}/>
						</button>
						<label htmlFor="changeDisplayName" className="labelCustom">{t("user.banner.changeName")}</label>
					</div>
					<div className="hidden lg:flex lg:p-12 flex-col text-left font-aldrich text-2xl text-slate-200">
						{/* <p className="font-bold p-2">ID: </p>
						<p className="tab-2">{user.userId || user.id || user._id}</p> */}
						<p className="font-bold p-2">{t("user.banner.email")}</p>
						<p>{user.email}</p>
						<p className="font-bold p-2">{t("user.banner.role")}</p>
						<p>{user.role}</p>
						<p className="font-bold p-2">{t("user.banner.validUntil")}</p> 
						<p>{user.exp ? new Date(user.exp * 1000).toLocaleString() : "N/A"}</p>
					</div>
				</div>
			</div>
			{/* Buttons */}
			<div className="w-full lg:w-1/3 p-10 gap-8 flex flex-col items-center justify-center text-2xl">
				<button onClick={backToGameBttn} className="customButton w-full">
					{t("user.backToGame")}
				</button>
				{error && <div style={{ color: "red" }}>{error}</div>}
				<button onClick={handleLogout} className="customButton w-full">
					{t("user.logout")}
				</button>
				{showLogoutConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black/60">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">{t("user.confirmLogout")}</p>
          					<div className="flex gap-4 text-2xl">
								<button id="confirmButton" className="px-4 py-2 bg-rose-500 text-white rounded font-aldrich" onClick={confirmLogout}>
									{t("user.buttonConfirm")}
								</button>
								<button id="denyButton" className="px-4 py-2 bg-gray-300 rounded font-aldrich" onClick={() => setShowLogoutConfirm(false)}>
									{t("user.buttonDeny")}
								</button>
          					</div>
        				</div>
      				</div>
				)}
				<button onClick={handleDelete} className="customButton w-full bg-linear-to-t from-rose-600 to-rose-400">
					{t("user.deleteAccount")}
				</button>
				{showDeleteConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black/60">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">{t("user.confirmDelete")}</p>
          					<div className="flex gap-4 text-2xl">
								<button id="confirmButton" className="px-4 py-2 bg-rose-500 text-white rounded font-aldrich" onClick={confirmDelete}>
									{t("user.buttonConfirm")}
								</button>
								<button id="denyButton" className="px-4 py-2 bg-gray-300 rounded font-aldrich" onClick={() => setShowDeleteConfirm(false)}>
									{t("user.buttonDeny")}
								</button>
          					</div>
        				</div>
      				</div>
				    )}
			</div>
		</div>
    )
}

export default User;