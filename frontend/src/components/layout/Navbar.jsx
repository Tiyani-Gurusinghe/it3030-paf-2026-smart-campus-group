import { useNavigate } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";
import NotificationPanel from "../notifications/NotificationPanel";

const ROLE_STYLES = {
  ADMIN: "role-badge-admin",
  TECHNICIAN: "role-badge-technician",
  USER: "role-badge-user",
};

function Navbar() {
  const navigate = useNavigate();
  const { user, primaryRole, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "SC";

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">🏛️</div>
        Smart Campus
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-actions">
        <NotificationPanel />

        {user && (
          <span className={`role-badge ${ROLE_STYLES[primaryRole] ?? "role-badge-user"}`}>
            {primaryRole}
          </span>
        )}

        {user && (
          <div className="navbar-user-info">
            <div className="navbar-avatar" title={user.fullName}>
              {initials}
            </div>
            <span className="navbar-username">{user.fullName}</span>
          </div>
        )}

        <button
          className="btn secondary navbar-logout-btn"
          onClick={handleLogout}
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

export default Navbar;