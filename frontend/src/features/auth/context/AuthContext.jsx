/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function normalizeRoleValue(role) {
  if (!role) return null;
  if (typeof role === "string") return role;
  if (typeof role.name === "string") return role.name;
  return null;
}

export function extractRoles(userData = {}) {
  if (Array.isArray(userData.roles)) {
    return userData.roles.map(normalizeRoleValue).filter(Boolean);
  }

  if (userData.role) {
    const singleRole = normalizeRoleValue(userData.role);
    return singleRole ? [singleRole] : ["USER"];
  }

  if (Array.isArray(userData.userRoles)) {
    const derivedRoles = userData.userRoles
      .map((userRole) => normalizeRoleValue(userRole?.role))
      .filter(Boolean);
    return derivedRoles.length ? derivedRoles : ["USER"];
  }

  return ["USER"];
}

/** Priority order: ADMIN > TECHNICIAN > USER */
export function getPrimaryRole(roles = []) {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("TECHNICIAN")) return "TECHNICIAN";
  return "USER";
}

export function getLandingRoute(roles = []) {
  const primary = getPrimaryRole(roles);
  
  // These MUST match the paths in your router.jsx
  if (primary === "ADMIN") return "/dashboard"; 
  if (primary === "TECHNICIAN") return "/dashboard";
  
  return "/"; 
}

function getStoredUser() {
  const rawUser = localStorage.getItem("authUser");
  if (!rawUser) return null;
  try {
    const parsed = JSON.parse(rawUser);
    return {
      id: parsed.id,
      fullName: parsed.fullName ?? parsed.name ?? "User",
      email: parsed.email ?? "",
      roles: extractRoles(parsed),
    };
  } catch {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userId");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  function login(userData) {
    const roles = extractRoles(userData);
    const normalizedUser = {
      id: userData.id,
      fullName: userData.fullName ?? userData.name ?? "User",
      email: userData.email ?? "",
      roles,
    };
    localStorage.setItem("authUser", JSON.stringify(normalizedUser));
    localStorage.setItem("userId", String(userData.id));
    setUser(normalizedUser);
    return normalizedUser;
  }

  function logout() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userId");
    setUser(null);
  }

  const value = useMemo(
    () => {
      // 1. Get the roles array from the user object
      const roles = user?.roles || [];
      
      // 2. Use your existing helper to find the highest role (ADMIN > TECHNICIAN > USER)
      const primaryRole = getPrimaryRole(roles);

      return {
        user,
        isAuthenticated: !!user,
        primaryRole, // 🚨 Added this so ResourceListPage stops getting 'undefined'
        isAdmin: primaryRole === "ADMIN",
        // 🚨 Staff is anyone who isn't just a basic USER
        isStaff: primaryRole === "ADMIN" || primaryRole === "TECHNICIAN",
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
