// TODO: USER page

import { useAuthContext } from "@/context/context";
import { useUser } from "@/hooks/useUser";

function User() {
    const { user, loading, error } = useUser();
    const { logout, deleteAccount } = useAuthContext();

    if (loading) return <div>Loading User...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>Not authenticated user.</div>;

    return (
        <div>
            <h2>FT_TRASCENDENCE - USER</h2>
            
                <b>ID: </b>{user.userId || user.id || user._id}
                <b> Email: </b>{user.email}
                <b> Role: </b>{user.role}
                <b> Valid until:</b> {user.exp ? new Date(user.exp * 1000).toLocaleString() : "N/A"}

            <ul>
                <button onClick={logout}>Logout</button>
                <button onClick={deleteAccount}>Delete</button>
            </ul>
        </div>
    )
}

export default User;

/**
 * User - User profile page.
 *
 * Fetches and displays information about the authenticated user.
 * Provides a logout button to end the session.
 */