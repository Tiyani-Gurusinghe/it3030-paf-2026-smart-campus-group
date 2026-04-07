import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: "⊞", label: "Dashboard" },
  { to: "/resources", icon: "📦", label: "Resources" },
  { to: "/bookings", icon: "📅", label: "Bookings" },
  { to: "/tickets", icon: "🎫", label: "Tickets" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Menu</div>
      <nav>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="sidebar-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;