import { useNavigate } from "react-router-dom";
import NotificationPanel from "../notifications/NotificationPanel";
import Breadcrumbs from "./Breadcrumbs";
import { useAuthContext } from "../../features/auth/context/AuthContext";

function Navbar() {
  const { user, logout, primaryRole } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Redirect to the public home page, not the protected dashboard ("/")
    window.location.href = "/home";
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : "SC";

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon" aria-hidden="true">SC</div>
        <div>
          <span className="navbar-brand-title">Smart Campus</span>
          <span className="navbar-brand-subtitle">SLIIT Operations Hub</span>
        </div>
      </div>
      
      <div className="navbar-breadcrumb-area">
        <Breadcrumbs />
      </div>

      <div className="navbar-spacer" />
      <div className="navbar-actions">
        <NotificationPanel />
        <div className="navbar-user-info">
          <div className="navbar-avatar" title={user?.fullName || "Profile"}>{initials}</div>
          <div className="navbar-user-text">
            <span className="navbar-username">{user?.fullName || "Smart Campus User"}</span>
            <span className={`role-badge role-badge-${primaryRole.toLowerCase()}`}>{primaryRole}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn secondary navbar-logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
