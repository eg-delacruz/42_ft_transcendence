import { useState, useEffect, useCallback } from "react";

export interface User {
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
        console.log("[useAuth] auth() called. Current user:", user);

        try {
            const res = await fetch("http://localhost:3000/api/auth/me", {
                credentials: "include",
            });
            const data = await res.json();
            console.log("[useAuth] auth() respone:", data);
            setUser(data.body?.user ?? null);
        }
        catch (err) {
            console.error("[useAuth] auth() error: ", err);
            setUser(null);

        }
        finally { setLoading(false); }
    }, []);

    // Called here in fact in the protected route comp to avoid called in each render
    useEffect(() => {
        auth();
    }, [auth]);

    // Login
    const login = useCallback(async (email: string, password: string) => {
        console.log("[useAuth] login() called with:", email);
        const res = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        console.log("[useAuth] login() response:", data);
        if (data.body?.user)
            setUser(data.body.user);
        return data;
    }, []);

    // Logout
    const logout = useCallback(async () => {
        console.log("[useAuth] logout() called");
        await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    }, []);

    // Register
    const register = useCallback(async (email: string, password: string) => {
        console.log("[useAuth] register() called with:", email);
        const res = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json();
        console.log("[useAuth] register() response:", data);
        if (data.body?.user) setUser(data.body.user);
        return data;
    }, []);

    //  Delete acount

    const deleteAccount = useCallback(async () => {
        console.log("[useAuth] deleteAccount() called with:", user.email);
        if (!user) return { error: "No user authenticated" };
        try {
            const res = await fetch(`http://localhost:3000/api/users/delete/${user.id || user._id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            setUser(null);
            return data;
        } catch (err) {
            return { error: "Network error: ", err };
        }
    }, [user]);

    return { user, auth, loading, login, logout, register, deleteAccount };
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