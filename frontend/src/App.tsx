import '@/App.css'; // styles
import { BrowserRouter, Routes, Route, Link } from "react-router-dom" // react-router
import { AuthProvider } from './context/context';
import 'tailwindcss';

import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import User from './pages/User';
import Game from './pages/Game';
import React, { useState } from "react";


{/* TODO: add protected routes, error routes... etc. */ }
const routes = [
  { path: "/", element: <Home></Home> },
  { path: "/login", element: <Login></Login> },
  { path: "/register", element: <Register></Register> },
  { path: "/user", element: <ProtectedRoute><User /></ProtectedRoute> },
  { path: "/game", element: <ProtectedRoute><Game /></ProtectedRoute>},

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
			<Route path="/game" element={<Game />} /> 
		</Routes>
		</BrowserRouter>
		</AuthProvider>
	</div>
  );
}

export default App;
