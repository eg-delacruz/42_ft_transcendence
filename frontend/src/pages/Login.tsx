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
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const [hoveredField, setHoveredField] = useState<string | null>(null);

    const handleSummit = async (e: React.FormEvent) => 
	{
        e.preventDefault();
        setError(null);
        const res = await login(email, password);

        if (res.error) 
			setError(res.error || "Login failed");
        else 
			navigate("/user");
    };

    return (
		<div className="h-screen flex flex-row bg-linear-to-t from-(--gradient-dark) to-(--gradient-light)">
			<div className="absolute inset-0 h-full w-full bg-[url(/tvstatic.gif)] opacity-10 bg-cover bg-no-repeat"></div>
			<div className="relative grid grid-rows-1 grid-cols-1 md:grid-rows-[200px_minmax(0,1fr)_200px] md:grid-cols-[200px_minmax(0,1fr)_200px] h-screen w-screen overflow-hidden">
					<div className="md:row-start-1 md:col-start-1 bg-[url(/frame-tl.png)] bg-contain bg-no-repeat"></div>
					<div className="md:row-start-1 md:col-start-2 bg-[url(/frame-t.png)] bg-contain bg-repeat-x"></div>
					<div className="md:row-start-1 md:col-start-3 bg-[url(/frame-tr.png)] bg-contain bg-no-repeat"></div>
					<div className="md:row-start-2 md:col-start-1 bg-[url(/frame-l.png)] bg-contain bg-repeat-y"></div>
					{/* FORM */}
					<div className="row-start-1 col-start-1 md:row-start-2 md:col-start-2 h-auto w-auto flex items-center justify-center overflow-auto">
						<div className="h-full md:h-4/5 w-full md:w-4/5 p-8 rounded-lg shadow-lg flex flex-col items-center justify-start text-neutral-100 bg-(--gradient-light) overflow-auto">
							<form onSubmit={handleSummit} className="p-8 mx-2 flex flex-col items-center justify-start">
								<h2 className="p-6 text-lg lg:text-4xl font-pressstart uppercase">ft_transcendance</h2>
								<div className="p-4">
									<div className="relative outline-none">
											<input
												className="arcadeform"
												type="email"
												placeholder="email"
												value={email}
												onChange={e => setEmail(e.target.value)}
												required
												onFocus={() => setFocusedField("email")}
												onBlur={() => setFocusedField(null)}
												onMouseEnter={() => setHoveredField("email")}
  												onMouseLeave={() => setHoveredField(null)}
											/>
										{(focusedField === "email" || hoveredField === "email") && (
											<span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 animate-sidebounce text-3xl">◄</span>
										)}
									</div>
								</div>
								<div className="p-4">
									<div className="relative outline-none">
											<input
												className="arcadeform"
												type="password"
												placeholder="PASSWORD"
												value={password}
												onChange={e => setPassword(e.target.value)}
												required
												onFocus={() => setFocusedField("password")}
												onBlur={() => setFocusedField(null)}
												onMouseEnter={() => setHoveredField("password")}
  												onMouseLeave={() => setHoveredField(null)}
											/>
										{(focusedField === "password" || hoveredField === "password") && (
											<span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 animate-sidebounce text-3xl">◄</span>
										)}
									</div>
								</div>
								<div className="p-4"></div>
								<button className="p-4 px-12 rounded-md font-pressstart text-2xl lg:text-3xl transition duration-300 ease-out hover:scale-110 focus:scale-110" 
									type="submit"
									onMouseEnter={() => setHoveredField("button")}
  									onMouseLeave={() => setHoveredField(null)}
  									onFocus={() => setFocusedField("button")}
  									onBlur={() => setFocusedField(null)}
								>Log in</button>
								{error && <div style={{ color: "red" }}>{error}</div>}
								{(hoveredField === "button" || focusedField === "button") && (
  									<span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 animate-sidebounce text-3xl">◄</span>
								)}
							</form>
							<div className="p-2 flex items-center">
								<p className="font-aldrich opacity-70">Don't have an account? <a href="/register" className="text-blue-300">Sign in</a></p>
							</div>
							<div className="p-2 flex items-center wrap-normal">
								<p className="font-aldrich opacity-70">🛈 Before logging in, you should read our <a href="" className="text-blue-300">Terms and conditions</a></p>
							</div>
						</div>
					</div>
					{/* END OF FORM */}	
					<div className="md:row-start-2 md:col-start-3 bg-[url(/frame-r.png)] bg-contain bg-repeat-y"></div>
					<div className="md:row-start-3 md:col-start-1 bg-[url(/frame-bl.png)] bg-contain bg-no-repeat"></div>
					<div className="md:row-start-3 md:col-start-2 bg-[url(/frame-b.png)] bg-contain bg-repeat-x"></div>
					<div className="md:row-start-3 md:col-start-3 bg-[url(/frame-br.png)] bg-contain bg-no-repeat"></div>
			</div>
		</div>
    );
}

export default Login;

/**
 * Login - User login page.
 *
 * Renders a form for user login.
 * On submit, calls the login function from the auth context.
 * Shows feedback on success or error.
 */
