// TODO: REGISTER page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/context";
import { isStrongPassword } from "@/utils/passwordUtils";

function Register() {
    const { register } = useAuthContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validPassword, setValidPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    // handles register summit
    const handleSummit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== validPassword)
            return setError("Passwords does not match");
        if (!isStrongPassword(password))
            return setError("Password not secure");
        const res = await register(email, password);

        if (res.error) setError(res.error || "Register failed");
        else navigate("/user"); // Optionally redirection to /user or show success
    }

    return (
        <form onSubmit={handleSummit}>
            <h2>FT_TRASCENDENCE - REGISTER PAGE</h2>
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
            <input
                type="password"
                placeholder="Repeat password"
                value={validPassword}
                onChange={e => setValidPassword(e.target.value)}
                required
            />
            <button type="submit">Register</button>
            {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
    );
}

export default Register;

/**
 * Register - User registration page.
 *
 * Renders a form to register a new user.
 * On submit, calls the register function from the auth context.
 * Shows feedback on success or error.
 */
