import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/context/context";

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuthContext();
   
    if (loading) return <div> Loading... </div>;
    return user ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;

/**
 *  Protected Route component to demand authentication in some places in the app
 * 
 *  IMPORTANT: using react-router-dom pnpm package
 * 
 *  Example of use:
 * 
 *  <Route path="/xPath" element={<ProtectedRoute><xElement /></ProtectedRoute>} />
 * 
 *  ->  Where xPath is the assigned path to a page and xElement its .tsx function
 */
