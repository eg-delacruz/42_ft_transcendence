import { useState, useEffect } from "react";

export function useUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("[useUser] called");
        setLoading(false);
        fetch("http://localhost:3000/api/auth/me", {
            credentials: "include"
        })
        .then(res => res.json())
        .then(data =>{
            if (data.body && data.body.user) setUser(data.body.user);
            else setError(data.error || "Not user found");
        })
        .catch(() => setError("Network error"))
        .finally(() => setLoading(false));
    }, []);

    return {user, loading, error};
}

/**
 * useUser - Custom React hook to fetch and manage the authenticated user's data.
 *
 * Fetches user info from the backend using the session cookie.
 * Returns user data, loading state, and error state.
 *
 * Usage:
 *   const { user, loading, error } = useUser();
 *
 *   // user: user object or null if not authenticated
 *   // loading: true while fetching
 *   // error: error message if fetch fails
 */