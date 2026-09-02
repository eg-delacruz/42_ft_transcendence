import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { api } from "@/utils/api";

const avatarOptions = [
	{ src: "/game01.jpg", alt: "Arcade avatar" },
	{ src: "/game02.png", alt: "Blue avatar" },
	{ src: "/game03.jpg", alt: "Retro avatar" },
	{ src: "/icon01.jpeg", alt: "Icon avatar" },
];


function User() {
	const { user, loading, error } = useUser();
	const { logout, deleteAccount, auth } = useAuthContext();
	const navigate = useNavigate();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);
	const [displayName, setDisplayname] = useState(user?.display_name ?? "");
	const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setDisplayname(user?.display_name ?? "");
		setAvatarUrl(user?.avatar_url ?? "");
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
			update.display_name = changes.displayName;
		}

		if (changes?.avatarUrl !== undefined) {
			update.avatar_url = changes.avatarUrl;
		}

		if (Object.keys(update).length === 0) {
			return;
		}

		setIsSaving(true);
		try {
			const response = await api.patch(`/users/update/${user._id || user.id}`, update);
			const updatedUser = response.body?.body ?? response.body?.user ?? response.body;

			if (updatedUser?.display_name !== undefined) {
				setDisplayname(updatedUser.display_name);
			}
			if (updatedUser?.avatar_url !== undefined) {
				setAvatarUrl(updatedUser.avatar_url);
			}

			await auth();
			setShowAvatarPicker(false);
		} finally {
			setIsSaving(false);
		}
	};

    if (loading) 
		return <div>Loading User...</div>;
    if (error) 
		return <div>Error: {error}</div>;
    if (!user) 
		return <div>Not authenticated user.</div>;


	//Would really like if this screen it's just a panel over the game screen instead of its own separate page
	//But we should first design it and THEN see if I can actually do that

	//User should have config toggles like changing name, pfp and color
    return (
        <div id="userPageContainer" className="h-screen w-screen p-8 gap-12 flex flex-col items-center bg-linear-to-t from-(--gradient-dark) to-(--gradient-light)">
			<div className="absolute inset-0 bg-[url(/arcadePatternRepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0" aria-hidden="true"></div>
			{showAvatarPicker && (
				<div className="absolute inset-0 z-50 flex items-start justify-center bg-black/60 pt-24">
					<div className="w-[min(92vw,30rem)] rounded-3xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-md">
						<div className="mb-4 flex items-center justify-between">
							<p className="font-aldrich text-2xl text-slate-100">Choose avatar</p>
							<button
								type="button"
								onClick={() => setShowAvatarPicker(false)}
								className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100 hover:bg-white/20"
							>
								Close
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
						<img src={avatarUrl || "/game01.jpg"} alt="User avatar" className="h-full w-full object-cover" />
						{/* Button to change pfp. This should be inside a /link tag or whatever is used to execute the function */}
					</div>
					<button
						id="changeProfilePic"
						type="button"
						onClick={() => setShowAvatarPicker(true)}
						className="absolute h-12 w-12 bg-black/50 rounded-sm bottom-2 right-2 flex items-center justify-center text-white text-xl">
							<FontAwesomeIcon icon={faPenToSquare}/>
					</button>
					<label htmlFor="changeProfilePic" className="labelCustom">Change pfp</label>	
				</div>
				<div className="w-auto flex flex-col lg:flex-row">
					<div className="w-full p-6 flex items-center gap-4 text-left font-aldrich text-md text-slate-200">
						<div className="outline-none w-full">
							<label className="labelCustom"> Display name 
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
						<label htmlFor="changeDisplayName" className="labelCustom">Change name</label>
					</div>
					<div className="hidden lg:flex lg:p-12 flex-col text-left font-aldrich text-2xl text-slate-200">
						{/* <p className="font-bold p-2">ID: </p>
						<p className="tab-2">{user.userId || user.id || user._id}</p> */}
						<p className="font-bold p-2">Email: </p>
						<p>{user.email}</p>
						<p className="font-bold p-2"> Role: </p>
						<p>{user.role}</p>
						<p className="font-bold p-2"> Valid until:</p> 
						<p>{user.exp ? new Date(user.exp * 1000).toLocaleString() : "N/A"}</p>
					</div>
				</div>
			</div>
			{/* Buttons */}
			<div className="w-full lg:w-1/3 p-10 gap-8 flex flex-col items-center justify-center text-2xl">
				<button onClick={backToGameBttn} className="customButton w-full">
					Back to game
				</button>
				{error && <div style={{ color: "red" }}>{error}</div>}
				<button onClick={handleLogout} className="customButton w-full">
					Logout
				</button>
				{showLogoutConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black/60">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">Are you sure you want to logout?</p>
          					<div className="flex gap-4 text-2xl">
								<button id="confirmButton" className="px-4 py-2 bg-rose-500 text-white rounded font-aldrich" onClick={confirmLogout}>
									Yes
								</button>
								<button id="denyButton" className="px-4 py-2 bg-gray-300 rounded font-aldrich" onClick={() => setShowLogoutConfirm(false)}>
									No
								</button>
          					</div>
        				</div>
      				</div>
				)}
				<button onClick={handleDelete} className="customButton w-full bg-linear-to-t from-rose-600 to-rose-400">
					Delete account
				</button>
				{showDeleteConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black/60">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">Are you sure you want to delete your account?</p>
          					<div className="flex gap-4 text-2xl">
								<button id="confirmButton" className="px-4 py-2 bg-rose-500 text-white rounded font-aldrich" onClick={confirmDelete}>
									Yes
								</button>
								<button id="denyButton" className="px-4 py-2 bg-gray-300 rounded font-aldrich" onClick={() => setShowDeleteConfirm(false)}>
									No
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