import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/utils/api";

export interface User {
    _id?: string;
    id?: string;
    username?: string;
    email: string;
    avatarUrl?: string;
    points?: number;
    state?: string;
    role?: string;
}

export function useAuth() {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Auth
    const auth = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/auth/me");
            const userData = data.body?.user ?? data.user ?? null;
            setUser(userData);
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
            const userData = data.body?.user ?? data.user;
            if (userData) {
                setUser(userData);
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
    const register = useCallback(async (email: string, password: string, username?: string) => {
        try {
            const payload = username ? { email, password, username } : { email, password };
            const data = await api.post("/auth/register", payload);
            const userData = data.body?.user ?? data.user;
            if (userData) {
                setUser(userData);
            }
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
            const userId = user.id || user._id;
            const data = await api.delete(`/users/delete/${userId}`);
            setUser(null); // Clear user state on successful deletion
            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                return { error: error.message };
            }
            return { error: "Network error or invalid response" };
        }
    }, [user]);

    return { user, loading, auth, login, register, logout, deleteAccount };
}