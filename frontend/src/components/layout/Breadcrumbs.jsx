import { Link, useLocation } from "react-router-dom";

const ROUTE_LABELS = {
  "": "Home",
  tickets: "Tickets",
  my: "My Tickets",
  create: "Create Ticket",
  new: "New",
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

// Maps a parent segment to a display name for a numeric child
const ID_LABELS = {
  tickets: "Ticket Details",
  bookings: "Booking Details",
  resources: "Resource Details",
};

function getLabel(segment, parentSeg) {
  if (!isNaN(Number(segment))) {
    return ID_LABELS[parentSeg] || `#${segment}`;
  }
  return ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  // Virtual parent crumbs: inject a logical parent when the URL doesn't include it.
  // e.g. /tickets/:id has no "my" segment, but logically lives under My Tickets.
  const VIRTUAL_PARENTS = {
    // When we see tickets/:id, prepend "My Tickets" → /tickets/my
    tickets_id: { label: "My Tickets", path: "/tickets/my" },
  };

  let crumbs = [];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const parentSeg = i > 0 ? segments[i - 1] : null;
    currentPath += "/" + seg;

    // Skip container segments that have no dedicated landing page
    const skipSegments = ["tickets"];
    if (skipSegments.includes(seg) && i < segments.length - 1) {
      continue;
    }

    // Inject a virtual parent before a numeric ticket ID
    if (!isNaN(Number(seg)) && parentSeg === "tickets") {
      const virtualKey = `${parentSeg}_id`;
      if (VIRTUAL_PARENTS[virtualKey]) {
        crumbs.push({
          label: VIRTUAL_PARENTS[virtualKey].label,
          path: VIRTUAL_PARENTS[virtualKey].path,
          isLast: false,
        });
      }
    }

    crumbs.push({
      label: getLabel(seg, parentSeg),
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