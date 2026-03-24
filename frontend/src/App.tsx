import '@/App.css'; // styles
import { BrowserRouter, Routes, Route, Link } from "react-router-dom" // react-router
import { AuthProvider } from './context/context';

import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import User from './pages/User';


{/* TODO: add protected routes, error routes... etc. */ }
const routes = [
  { path: "/", element: <Home></Home> },
  { path: "/login", element: <Login></Login> },
  { path: "/register", element: <Register></Register> },
  { path: "/user", element: <ProtectedRoute><User /></ProtectedRoute> }

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
          <Link to="/user">User</Link> {""}
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
