import '@/App.css'; // styles
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // react-router
import { AuthProvider } from '@/context/context';

import ProtectedRoute from '@components/ProtectedRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import User from '@/pages/User';
import SocketDebug from './pages/SocketDebug';

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
  { path: "/socket-debug", element: <ProtectedRoute><SocketDebug /></ProtectedRoute> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/game", element: <GameCanvas /> },

  /* Terto 20260614 - Ruta temporal para acceder al menú general de minijuegos.*/
  { path: "/minigames", element: <MinigamesDevPage /> }
]

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* simple nav system implemented for testing */}
        <nav>
          <Link to="/">Home</Link> | {""}
          <Link to="/login">Login</Link> | {""}
          <Link to="/register">Register</Link> | {""}
          <Link to="/user">User</Link> | {""}
          <Link to="/socket-debug">Socket Debug</Link> | {""}
          <Link to="/privacy">Privacy Policy</Link> | {""}
          <Link to="/terms">Terms of Service</Link> | {""}
          <Link to="/minigames">Minigames</Link> | {""}
          <Link to="/game">Game</Link> | {""}
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