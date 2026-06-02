import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'


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
  		setShowConfirm(false);
	};

	const confirmDelete = () => {
  		deleteAccount();
  		navigate("/");
  		setShowConfirm(false);
		console.log("Deleted");
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
        <div className="h-screen w-screen p-8 gap-12 flex flex-col lg:flex-row items-center bg-linear-to-t from-indigo-900 to-purple-900">
			<div className="h-130 w-3/4 p-16 flex flex-row bg-slate-900/40 shadow-2xs rounded-4xl">
				<div className="relative rounded-full aspect-square object-cover outline-4 outline-slate-300 box-shadow-md bg-[url(/game01.jpg)] items-end justify-end">
					<div className="absolute h-14 p-2 aspect-square bg-black/50 rounded-sm bottom-5 right-5 text-center align-baseline text-white text-3xl">
						{/* Button to change pfp. This should be inside a /link tag or whatever is used to execute the function */}
						<FontAwesomeIcon className="" icon={faPenToSquare}/>
					</div>
				</div>
				<div className="w-auto h-full p-12 flex flex-col text-left font-aldrich text-2xl text-slate-200">
					<p className="font-bold p-2">ID: </p>
					<p className="tab-2">{user.userId || user.id || user._id}</p>
                	<p className="font-bold p-2">Email: </p>
					<p>{user.email}</p>
                	<p className="font-bold p-2"> Role: </p>
					<p>{user.role}</p>
                	<p className="font-bold p-2"> Valid until:</p> 
					<p>{user.exp ? new Date(user.exp * 1000).toLocaleString() : "N/A"}</p>
				</div>
			</div>
			<div className="w-1/4 p-12 gap-8 flex flex-col items-center justify-center">
				{/* Room buttons */}
				<div className="flex flex-col">
					<div className="p-4">
						<div className="relative outline-none">
							<input
							className="arcadeform"
							type="code"
							placeholder="code"
							//value={code}
							//onChange={e => setEmail(e.target.value)}
							/>
						</div>
					</div>
					{/* These are <a> because they are just links to other pages right now, they can be changed to buttons */}
					<div className=" flex flex-col lg:flex-row gap-4">
						<button className="userbutton" 
							>Join room</button>
							{error && <div style={{ color: "red" }}>{error}</div>}
						<a className="userbutton" href="/game">
							<p>Create room</p>
						</a>
					</div>
				</div>
				{/* Account buttons */}
				<div className="flex flex-row gap-4">
				   <button onClick={handleLogout} className="userbutton">
					   <p>Logout</p>
				   </button>
				    {showLogoutConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black opacity-50">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">Are you sure you want to logout?</p>
          					<div className="flex gap-4 text-2xl">
            			<button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={confirmLogout}>Yes</button>
            			<button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowLogoutConfirm(false)}>No</button>
          					</div>
        				</div>
      				</div>
				    )}
				<button onClick={handleDelete} className="userbutton">
					<p>Delete account</p>
				</button>
				{showDeleteConfirm && (
      				<div className="absolute inset-0 flex items-center justify-center z-50 animate-appear bg-black opacity-50">
        				<div className="bg-slate-100 p-8 rounded shadow-lg flex flex-col items-center animate-slideintop">
          					<p className="mb-6 text-3xl font-aldrich font-bold">Are you sure you want to delete your account?</p>
          					<div className="flex gap-4 text-2xl">
            			<button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={confirmDelete}>Yes</button>
            			<button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDeleteConfirm(false)}>No</button>
          					</div>
        				</div>
      				</div>
				    )}
				</div>
			</div>
		</div>
    )
}

export default User;