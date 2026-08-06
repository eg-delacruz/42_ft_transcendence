import '@/App.css'; // styles
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // react-router
import { AuthProvider } from '@/context/context';

import ProtectedRoute from '@components/ProtectedRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import User from '@/pages/User';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

import { GameCanvas } from '@components/GameCanvas';

{/* TODO: add protected routes, error routes... etc. */ }
const routes = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/user", element: <ProtectedRoute><User /></ProtectedRoute> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/game", element: <GameCanvas /> }
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar con todos los links */}
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-extrabold text-indigo-400 tracking-wider text-lg">
            FT_TRANSCENDENCE
          </Link>
          <div className="flex gap-4 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/game" className="hover:text-white transition-colors">Game</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/user" className="hover:text-white transition-colors">User</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;