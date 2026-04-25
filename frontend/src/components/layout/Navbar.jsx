import { useNavigate } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";
import NotificationPanel from "../notifications/NotificationPanel";
import { googleLogout } from "@react-oauth/google";

const ROLE_STYLES = {
  ADMIN: "role-badge-admin",
  TECHNICIAN: "role-badge-technician",
  USER: "role-badge-user",
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    googleLogout();
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : "SC";

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">🏛️</div>
        Smart Campus
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <NotificationPanel />
        <div className="navbar-avatar" title={user?.fullName || "Profile"}>{initials}</div>
        <button onClick={handleLogout} className="btn secondary" style={{ padding: '6px 12px', fontSize: '12px', height: 'fit-content' }}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;