import '@/App.css'; // styles
import 'tailwindcss';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // react-router
import { AuthProvider } from '@/context/context';

import ProtectedRoute from '@components/ProtectedRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import User from '@/pages/User';
import SocketDebug from './pages/SocketDebug';
import GameRoom from './pages/GameRoom';
import React, { useState } from "react";

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
  { path: "/socket-debug", element: <ProtectedRoute><SocketDebug /></ProtectedRoute> },
  { path: "/user", element: <ProtectedRoute><User /></ProtectedRoute> },
  { path: "/gameroom", element: <ProtectedRoute><GameRoom /></ProtectedRoute>},
  { path: "/socket-debug", element: <ProtectedRoute><SocketDebug /></ProtectedRoute> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/game", element: <GameCanvas /> },

  /* Terto 20260614 - Ruta temporal para acceder al menú general de minijuegos.*/
  { path: "/minigames", element: <MinigamesDevPage /> }
]

function App() {

	const [showPage, setShowPage] = useState(true);

  return (
	<div className={showPage ? "page-enter page-enter-active" : "page-exit page-exit-active"}>
		<AuthProvider>
		<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/user" element={<User />} />
			<Route path="/gameroom" element={<GameRoom />} />
			<Route path="/privacy" element={<PrivacyPolicy />} />
			<Route path="/terms" element={<TermsOfService />} />
		</Routes>
		</BrowserRouter>
		</AuthProvider>
	</div>
  );
}

export default App;