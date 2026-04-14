import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function getStoredUser() {
  const rawUser = localStorage.getItem("authUser");
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userId");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  function login(userData) {
    const normalizedUser = {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role ?? "STUDENT", // include role from backend
    };
    localStorage.setItem("authUser", JSON.stringify(normalizedUser));
    localStorage.setItem("userId", String(userData.id));
    setUser(normalizedUser);
  }

  function logout() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userId");
    setUser(null);
  }

  const value = useMemo(
    () => {
      const roleStr = user?.role?.toUpperCase() || "STUDENT";
      return {
        user,
        isAuthenticated: !!user,
        isAdmin: roleStr === "ADMIN",
        isStaff: !!user && roleStr !== "USER" && roleStr !== "STUDENT",
        login,
        logout,
      };
    },
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
