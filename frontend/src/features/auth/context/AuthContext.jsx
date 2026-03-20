import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    name: "Demo User",
    role: "ADMIN",
  });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login: (userData) => setUser(userData),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}