// TODO: Login page

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/context";


function Login() {
    const { login } = useAuthContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    // handles login summit
    const handleSummit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await login(email, password);

        if (res.error) setError(res.error || "Login failed");
        else navigate("/user");
    };

    return (
        <form onSubmit={handleSummit}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button type="submit">Login</button>
            {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
    );
}

export default Login;

/**
 * Login page
 * - Uses useAuthContext() for login
 * - Redirects to /user on success
 * - Shows error message on failure
 */