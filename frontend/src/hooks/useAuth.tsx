import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/utils/api";

export interface User {
    _id: string; // Corrected to _id to match MongoDB
    id: string;
    email: string;
    // TODO: implement more fields as backend need
}

export function useAuth() {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Auth
    const auth = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/auth/me");
            setUser(data.body?.user ?? null);
            return data;
        } catch (error) {
            setUser(null);
            if (error instanceof ApiError) {
                // Don't log 401 errors as they are expected when not logged in
                if (error.status !== 401) console.error("Auth failed", error);
                return { error: error.message };
            }
            return { error: "Network error or invalid response" };
        } finally {
            setLoading(false);
        }
    }, []);

    // Called on initial load to check authentication status
    useEffect(() => {
        auth();
    }, [auth]);

    // Login
    const login = useCallback(async (email: string, password: string) => {
        try {
            const data = await api.post("/auth/login", { email, password });
            if (data.body?.user) {
                setUser(data.body.user);
            }
            return data;
        } catch (error) {
            setUser(null);
            if (error instanceof ApiError) {
                return { error: error.message };
            }
            return { error: "Network error or invalid response" };
        }
    }, []);

    // Register
    const register = useCallback(async (email: string, password: string) => {
        try {
            const data = await api.post("/auth/register", { email, password });
            // After registration, you might want to automatically log the user in
            // or prompt them to log in. Here, we just return the response.
            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                return { error: error.message };
            }
            return { error: "Network error or invalid response" };
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout", {});
        } catch (error) {
            console.error("Logout failed on server", error);
        } finally {
            // Always clear user state on logout, even if server call fails
            setUser(null);
        }
    }, []);

    // Delete account
    const deleteAccount = useCallback(async () => {
        if (!user) return { error: "No user authenticated" };
        try {
            // Ensure you are using the correct user ID field (_id for MongoDB)
            const data = await api.delete(`/users/delete/${user._id || user.id}`);
            setUser(null); // Clear user state on successful deletion
            return data;
        } catch (error) {
            // The user state is not cleared on failure, allowing for retry
            if (error instanceof ApiError) {
                return { error: error.message };
            }
            return { error: "Network error or invalid response" };
        }
    }, [user]);

    return { user, loading, auth, login, register, logout, deleteAccount };
}



/**
 * useAuth - Custom React hook for user authentication management.
 *
 * Gives:
 *  - State from authenticated user (user)
 *  - Loading state(loading)
 *  - Functions for login, logout and register
 * 
 * Recommended use with AuthProvider for global access in the app.
 *
 * Usage:
 *   const { user, loading, login, logout, register } = useAuth();
 *
 *   // auth:
 *   await auth();
 * 
 *   // login:
 *   await login(email, password);
 *
 *   // logout:
 *   await logout();
 *
 *   // register:
 *   await register(email, password);
 *
 *   // user will be null if there is not active sesion.
 */