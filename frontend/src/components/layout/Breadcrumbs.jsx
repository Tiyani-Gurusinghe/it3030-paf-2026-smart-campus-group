import { Link, useLocation } from "react-router-dom";

const ROUTE_LABELS = {
  "": "Home",
  tickets: "Tickets",
  my: "My Tickets",
  create: "Create Ticket",
  edit: "Edit",
  admin: "Admin",
  technician: "Technician",
  facilities: "Facilities",
  bookings: "Bookings",
  notifications: "Notifications",
  profile: "Profile",
  resources: "Resources",
  dashboard: "Dashboard",
};

function getLabel(segment) {
  if (!isNaN(Number(segment))) return `#${segment}`;
  return ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  let crumbs = [];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += "/" + seg;

    // Skip the generic "tickets" segment as there is no base /tickets page
    if (seg === "tickets" && i < segments.length - 1) {
      continue;
    }

    crumbs.push({
      label: getLabel(seg),
      path: currentPath,
      isLast: i === segments.length - 1,
    });
  }

  return (
    <nav className="navbar-breadcrumbs" aria-label="Breadcrumb">
      <span className="breadcrumb-sep" aria-hidden="true">/</span>
      {crumbs.map((crumb) =>
        crumb.isLast ? (
          <span key={crumb.path} className="breadcrumb-current" aria-current="page">
            {crumb.label}
          </span>
        ) : (
          <span key={crumb.path} className="breadcrumb-item">
            <Link to={crumb.path} className="breadcrumb-link">
              {crumb.label}
            </Link>
            <span className="breadcrumb-sep" aria-hidden="true">/</span>
          </span>
        )
      )}
    </nav>
  );
}
