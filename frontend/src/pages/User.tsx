import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


function User() {
	const { user, loading, error } = useUser();
	const { logout, deleteAccount } = useAuthContext();
	const navigate = useNavigate();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	// const handleLogout = () => {
	// 	if (window.confirm("Are you sure you want to logout?")) {
	// 		logout();
	// 		navigate("/");
	// 	}
	// };

	const handleLogout = () => setShowLogoutConfirm(true);
	const handleDelete = () => setShowDeleteConfirm(true);

	const confirmLogout = () => {
  		logout();
  		navigate("/");
  		setShowConfirm(false);
	};

	const confirmDelete = () => {
  		logout();
  		navigate("/");
  		setShowConfirm(false);
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
	//The delete account does not work cause I still can log in
    return (
        <div className="h-screen w-screen p-16 flex flex-col items-center bg-linear-to-t from-indigo-900 to-purple-900">
			<div className="h-130 w-2/3 p-16 flex flex-row bg-slate-900/40 shadow-2xs rounded-4xl">
				<div className="rounded-full aspect-square object-cover outline-4 outline-slate-300 box-shadow-md bg-[url(/game01.jpg)]">
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
			<div className="w-2/3 p-12 gap-8 flex flex-col lg:flex-row items-center justify-center">
				<a className="p-8 px-12 rounded-md text-center text-3xl font-bold text-slate-800 bg-slate-300 transition duration-300 ease-out hover:bg-slate-400 hover:text-slate-900 hover:scale-110 focus:outline-1" href="/game">
					<p>Back to game</p>
				</a>
				   <button onClick={handleLogout} className="p-8 px-12 rounded-md text-center text-3xl font-bold text-slate-800 bg-slate-300 transition duration-300 ease-out hover:bg-slate-400 hover:text-slate-900 hover:scale-110 focus:outline-1">
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
				<button onClick={handleDelete} className="p-8 px-12 rounded-md text-center text-3xl font-bold text-slate-800 bg-slate-300 transition duration-300 ease-out hover:bg-slate-400 hover:text-slate-900 hover:scale-110 focus:outline-1">
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
    )
}

export default User;

            // {/* <h2>FT_TRASCENDENCE - USER</h2>
            
            //     <b>ID: </b>{user.userId || user.id || user._id}
            //     <b> Email: </b>{user.email}
            //     <b> Role: </b>{user.role}
            //     <b> Valid until:</b> {user.exp ? new Date(user.exp * 1000).toLocaleString() : "N/A"}

            // <ul>
            //     <button onClick={logout}>Logout </button>
            //     <button onClick={deleteAccount}>Delete</button>
            // </ul>
			
			// <div className="relative w-400 h-250 overflow-hidden rounded-10 shadow-2xs flex" id="slider">
    		// 	<div className="absolute w-full h-full flex items-center justify-center text-lg tetx-bold text-white anim-try bg-blue-300 transform-">Panel 1</div>
    		// 	<div className="absolute w-full h-full flex items-center justify-center text-lg tetx-bold text-white anim-try bg-green-200">Panel 2</div>
			// </div>
			// <button onclick="togglePanel()">Toggle Panel</button> */}