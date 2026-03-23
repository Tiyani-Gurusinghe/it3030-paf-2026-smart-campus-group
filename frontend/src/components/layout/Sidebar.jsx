import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/resources">Resources</NavLink>
        <NavLink to="/bookings">Bookings</NavLink>
        <NavLink to="/tickets">Tickets</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;