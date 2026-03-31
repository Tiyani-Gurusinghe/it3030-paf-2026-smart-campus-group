import NotificationPanel from "../notifications/NotificationPanel";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">🏛️</div>
        Smart Campus
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-actions">
        <NotificationPanel />
        <div className="navbar-avatar" title="Profile">SC</div>
      </div>
    </header>
  );
}

export default Navbar;