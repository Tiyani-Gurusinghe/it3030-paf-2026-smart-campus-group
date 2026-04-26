import { NavLink } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";

const USER_NAV = [
  { to: "/user/dashboard", icon: "⊞", label: "Dashboard" },
  { to: "/tickets/my", icon: "🎫", label: "My Tickets" },
  { to: "/tickets/create", icon: "➕", label: "Create Ticket" },
  { to: "/resources", icon: "🏢", label: "Facilities" },
  { to: "/bookings", icon: "📅", label: "Bookings" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

const TECHNICIAN_NAV = [
  { to: "/technician/dashboard", icon: "⊞", label: "Dashboard" },
  { to: "/technician/tickets", icon: "🔧", label: "Assigned Tickets" },
  { to: "/resources", icon: "🏢", label: "Facilities" },
  { to: "/bookings", icon: "📅", label: "Bookings" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", icon: "⊞", label: "Dashboard" },
  { to: "/admin/tickets", icon: "🛡️", label: "All Tickets" },
  { to: "/resources", icon: "🏢", label: "Facilities" },
  { to: "/bookings", icon: "📅", label: "Bookings" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

function getNav(primaryRole) {
  if (primaryRole === "ADMIN") return ADMIN_NAV;
  if (primaryRole === "TECHNICIAN") return TECHNICIAN_NAV;
  return USER_NAV;
}

function Sidebar() {
  const { primaryRole } = useAuth();
  const navItems = getNav(primaryRole);

  return (
    <aside className="sidebar">
      <div className="sidebar-campus-card">
        <span className="sidebar-campus-kicker">Sri Lanka Institute</span>
        <strong>Campus Control</strong>
        <span>{primaryRole.toLowerCase()} workspace</span>
      </div>
      <div className="sidebar-section-label">Menu</div>
      <nav>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
