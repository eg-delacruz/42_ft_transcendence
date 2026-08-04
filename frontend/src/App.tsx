import '@/App.css'; // styles
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // react-router
import { AuthProvider } from './context/context';

import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import User from './pages/User';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import { GameCanvas } from './components/GameCanvas';

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
        {/* simple nav system implemented for testing */}
        <nav>
          <Link to="/">Home</Link> | {" "}
          <Link to="/login">Login</Link> | {" "}
          <Link to="/register">Register</Link> | {" "}
          <Link to="/user">User</Link> | {" "}
          <Link to="/game">Game</Link> | {" "}
          <Link to="/privacy">Privacy</Link> | {" "}
          <Link to="/terms">Terms</Link>
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