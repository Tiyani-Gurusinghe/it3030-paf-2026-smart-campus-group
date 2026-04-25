import { NavLink } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";

const USER_NAV = [
  { to: "/tickets/my", label: "My Tickets" },
  { to: "/tickets/create", label: "Create Ticket" },
  { to: "/resources", label: "Facilities" },
  { to: "/bookings", label: "Bookings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/profile", label: "Profile" },
];

const TECHNICIAN_NAV = [
  { to: "/technician/tickets", label: "Assigned Tickets" },
  { to: "/resources", label: "Facilities" },
  { to: "/bookings", label: "Bookings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/profile", label: "Profile" },
];

const ADMIN_NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/admin/tickets", label: "All Tickets" },
  { to: "/resources", label: "Facilities" },
  { to: "/bookings", label: "Bookings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/profile", label: "Profile" },
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
