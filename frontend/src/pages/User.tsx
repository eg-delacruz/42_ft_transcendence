import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'


function User() {
	const { user, loading, error } = useUser();
	const { logout, deleteAccount } = useAuthContext();
	const navigate = useNavigate();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

	const buttonTest = () => {
		console.log("LOL");
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
        <div className="h-screen w-screen p-8 gap-12 flex flex-col items-center bg-linear-to-t from-(--gradient-dark) to-(--gradient-light)">
			<div className="absolute inset-0 bg-[url(/arcadePatternRepeat.png)] bg-auto animate-diagonal opacity-10 pointer-events-none z-0" aria-hidden="true"></div>
			{/* Top part / banner */}
			<div className="relative h-1/3 w-full grid grid-cols-4 bg-(--gradient-light) shadow-2xs rounded-4xl overflow-auto">
				<div className="col-start-1 flex items-center justify-center p-4">
					<div className="relative h-full aspect-square rounded-full bg-[url(/game01.jpg)] bg-cover bg-center outline-4 outline-slate-300 shadow-md flex items-end justify-end">
						{/* Button to change pfp. This should be inside a /link tag or whatever is used to execute the function */}
						<button id="changeProfilePic" onClick={buttonTest} className="absolute h-12 w-12 bg-black/50 rounded-sm bottom-2 right-2 flex items-center justify-center text-white text-xl">
							<FontAwesomeIcon icon={faPenToSquare}/>
						</button>
						<label htmlFor="changeProfilePic" className="labelCustom">Change pfp</label>
						
					</div>
				</div>
				<div className="col-start-2 col-end-3 w-full p-6 flex items-center gap-4 text-left font-aldrich text-md text-slate-200">
					<div className="outline-none w-full">
						<label className="labelCustom"> Display name 
						<input
							className="w-full p-4 arcadeform flex-1"
							type="text"
							placeholder="display"
						/></label>
					</div>
					{/* Button to change display name. */}
					<button id="changeDisplayName" onClick={buttonTest} className="h-14 w-14 flex items-center justify-center bg-black/50 rounded-sm text-white text-2xl">
						<FontAwesomeIcon className="" icon={faArrowsRotate}/>
					</button>
					<label htmlFor="changeDisplayName" className="labelCustom">Change pfp</label>
					
				</div>
				<div className="w-auto h-full p-12 col-start-4 flex flex-col text-left font-aldrich text-2xl text-slate-200">
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
			<div className="w-full lg:w-1/3 p-10 gap-8 flex flex-col items-center justify-center text-2xl">
				{/* Room buttons */}
					<div className="relative w-full">
						<label className="labelCustom">Write code to join a room
						<input
						className="arcadeform bg-mauve-500"
						type="code"
						placeholder="code"
						text-label="room code"
						//value={code}
						//onChange={e => setEmail(e.target.value)}
						/></label>
					</div>
					{/* These are <a> because they are just links to other pages right now, they can be changed to buttons */}
						<button onClick={buttonTest} className="customButton w-full">
							Join room
						</button>
						{error && <div style={{ color: "red" }}>{error}</div>}
						<button onClick={buttonTest} className="customButton w-full">
							Create room
						</button>
						{error && <div style={{ color: "red" }}>{error}</div>}
				{/* Account buttons */}
				   <button onClick={handleLogout} className="customButton w-full">
					   Logout
				   </button>
				    {showLogoutConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black/60">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">Are you sure you want to logout?</p>
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
				<button onClick={handleDelete} className="customButton w-full bg-linear-to-t from-rose-600 to-rose-400">
					Delete account
				</button>
				{showDeleteConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black/60">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">Are you sure you want to delete your account?</p>
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
			</div>
		</div>
    )
}

export default User;