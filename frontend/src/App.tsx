import '@/App.css'; // styles
import 'tailwindcss';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from "react-router-dom"; // react-router
import { AuthProvider, useAuthContext } from '@/context/context';
import { SocketProvider } from '@/hooks/useSocket';

import ProtectedRoute from '@components/ProtectedRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import User from '@/pages/User';
import Chat from './pages/Chat';
import GameRoom from './pages/GameRoom';
import React, { useState, useEffect } from "react";

/* Terto 20260614 - Import temporal para poder acceder a la página general de minijuegos. */
import { MinigamesDevPage } from './minigames/MinigamesDevPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

// DAVID GAME CANVAS
import { GameCanvas } from '@components/GameCanvas';

{/* TODO: add protected routes, error routes... etc. */ }
const routes = [
  { path: "/", element: <Home></Home> },
  { path: "/login", element: <Login></Login> },
  { path: "/register", element: <Register></Register> },
  { path: "/user", element: <ProtectedRoute><User /></ProtectedRoute> },
  { path: "/gameroom", element: <ProtectedRoute><GameRoom /></ProtectedRoute>},
  { path: "/chat", element: <ProtectedRoute><Chat /></ProtectedRoute> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/game", element: <GameCanvas /> },

  /* Terto 20260614 - Ruta temporal para acceder al menú general de minijuegos.*/
  { path: "/minigames", element: <MinigamesDevPage /> }
]

function RequireAuth() {
		const { user, auth } = useAuthContext();
		const [checked, setChecked] = useState(!!user);

		useEffect(() => {
			if (user) return setChecked(true);
			auth().finally(() => setChecked(true));
		}, []);

		if (!checked) 
			return null;
		return user ? <Outlet /> : <Navigate to="/login" replace />;
	}

	function AuthLayout() {
		return (
			<AuthProvider>
				<Outlet />
			</AuthProvider>
		);
	}

	function SocketLayout() {
		return (
			<SocketProvider>
				<Outlet />
			</SocketProvider>
		);
	}

function App() {

	const [showPage, setShowPage] = useState(true);

  return (
	<div className={showPage ? "page-enter page-enter-active" : "page-exit page-exit-active"}>
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/privacy" element={<PrivacyPolicy />} />
			<Route path="/terms" element={<TermsOfService />} />

			<Route element={<AuthLayout />}>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route element={<RequireAuth />}>
						<Route path="/user" element={<User />} />
					<Route element={<SocketLayout />}>
						<Route path="/gameroom" element={<GameRoom />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	</BrowserRouter>
	</div>
  );
}

export default App;