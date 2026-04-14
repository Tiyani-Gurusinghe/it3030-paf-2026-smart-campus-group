import NotificationPanel from "../notifications/NotificationPanel";
import { useAuthContext } from "../../features/auth/context/AuthContext";

function Navbar() {
  const { user, logout } = useAuthContext();
  
  const handleLogout = () => {
    logout();
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