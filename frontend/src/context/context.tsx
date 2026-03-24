import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

/**
 * AuthProvider - Global context of authentication for the app
 * 
 * Gives access to:
 *  - Authenticated user state and authentication functions (useAuth)
 *  - Allows use the context from whatever component using useAuthContext()
 * 
 * Usage:
 *  Wraps the app with <AuthProvider in App.tsx or main.tsx
 *   
 * Example:
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *
 * To consume the context:
 *   import { useAuthContext } from "@/context/context";
 *   const { user, login, logout } = useAuthContext();
 */