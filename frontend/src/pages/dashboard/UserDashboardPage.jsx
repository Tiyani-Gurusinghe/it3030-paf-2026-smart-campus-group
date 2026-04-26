import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";
import { bookingApi } from "../../features/bookings/api/bookingApi";
import resourceApi from "../../features/resources/api/resourceApi";
import { getMyTickets } from "../../api/ticket/ticketApi";
import { getNotifications } from "../../api/notification/notificationApi";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status) => {
  if (["APPROVED", "RESOLVED", "COMPLETED", "CLOSED"].includes(status)) return "resolved";
  if (["REJECTED", "CANCELLED"].includes(status)) return "rejected";
  if (["IN_PROGRESS", "PENDING"].includes(status)) return "pending";
  return "open";
};

const statusLabel = (status) => {
  if (!status) return "unknown";
  if (status === "REJECTED") return "declined";
  return status.replaceAll("_", " ").toLowerCase();
};

const unwrapAxiosList = (response) => response?.data?.data || response?.data || response || [];
const unwrapPage = (data) => Array.isArray(data) ? data : data?.content || [];

function UserDashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError("");

    Promise.allSettled([
      getMyTickets({ page: 0, size: 100 }),
      bookingApi.getByUserId(user.id),
      getNotifications(),
      resourceApi.getAllResources(),
    ])
      .then(([ticketResult, bookingResult, notificationResult, resourceResult]) => {
        if (ignore) return;

        if (ticketResult.status === "fulfilled") {
          setTickets(unwrapPage(ticketResult.value));
        }

        if (bookingResult.status === "fulfilled") {
          setBookings(unwrapAxiosList(bookingResult.value));
        }

        if (notificationResult.status === "fulfilled") {
          setNotifications(Array.isArray(notificationResult.value) ? notificationResult.value : []);
        }

        if (resourceResult.status === "fulfilled") {
          setResources(Array.isArray(resourceResult.value) ? resourceResult.value : []);
        }

        const failed = [ticketResult, bookingResult, notificationResult, resourceResult]
          .filter((result) => result.status === "rejected");
        if (failed.length > 0) {
          setError("Some dashboard data could not be loaded. Check that the backend is running.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const dashboardData = useMemo(() => {
    const now = new Date();
    const activeTickets = tickets.filter((ticket) => ["OPEN", "IN_PROGRESS"].includes(ticket.status));
    const pendingBookings = bookings.filter((booking) => booking.status === "PENDING");
    const approvedUpcoming = bookings
      .filter((booking) => ["PENDING", "APPROVED"].includes(booking.status))
      .filter((booking) => new Date(booking.startTime) >= now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const unreadNotifications = notifications.filter((notification) => !notification.read);
    const suggestedResources = resources
      .filter((resource) => resource.status === "ACTIVE")
      .filter((resource) => ["SPACE", "EQUIPMENT", "UTILITY"].includes(resource.category))
      .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))
      .slice(0, 4);

    return {
      activeTickets,
      pendingBookings,
      approvedUpcoming,
      unreadNotifications,
      suggestedResources,
      recentTickets: [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
      recentBookings: [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
    };
  }, [bookings, notifications, resources, tickets]);

  const headlineStats = [
    {
      label: "Active Tickets",
      value: dashboardData.activeTickets.length,
      copy: "Open or in-progress reports you are tracking.",
      tone: "blue",
      to: "/tickets/my",
    },
    {
      label: "Upcoming Bookings",
      value: dashboardData.approvedUpcoming.length,
      copy: "Reservations still ahead on your calendar.",
      tone: "orange",
      to: "/bookings",
    },
    {
      label: "Pending Approvals",
      value: dashboardData.pendingBookings.length,
      copy: "Bookings waiting for admin review.",
      tone: "red",
      to: "/bookings",
    },
    {
      label: "Unread Alerts",
      value: dashboardData.unreadNotifications.length,
      copy: "Notifications you have not opened yet.",
      tone: "green",
      to: "/notifications",
    },
  ];

  return (
    <div className="page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">User Workspace</span>
          <h1>Smart Campus Dashboard</h1>
          <p>
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}. Track your tickets,
            manage bookings, open notifications, and jump back into campus resources.
          </p>
        </div>
        <div className="dashboard-mark">SC</div>
      </div>

      {error && <div className="error-box dashboard-alert">{error}</div>}

      {loading ? (
        <div className="dashboard-grid dashboard-grid-four">
          {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton-card" />)}
        </div>
      ) : (
        <>
          <div className="dashboard-grid dashboard-grid-four">
            {headlineStats.map((stat) => (
              <Link key={stat.label} to={stat.to} className={`card dashboard-stat-card dashboard-stat-${stat.tone}`}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.copy}</p>
              </Link>
            ))}
          </div>

          <div className="dashboard-user-actions">
            <Link to="/tickets/create" className="btn primary">Create Ticket</Link>
            <Link to="/resources" className="btn secondary">Browse Facilities</Link>
            <Link to="/bookings/new" className="btn secondary">New Booking</Link>
            <Link to="/notifications" className="btn secondary">View Notifications</Link>
          </div>

          <div className="dashboard-panel-grid">
            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Next Booking</h2>
                  <p>Your closest upcoming reservation</p>
                </div>
                <Link to="/bookings" className="btn secondary">All bookings</Link>
              </div>
              {dashboardData.approvedUpcoming.length === 0 ? (
                <p className="subtext">No upcoming bookings.</p>
              ) : (
                <div className="dashboard-feature-booking">
                  <strong>{dashboardData.approvedUpcoming[0].resourceName}</strong>
                  <span>{formatDateTime(dashboardData.approvedUpcoming[0].startTime)}</span>
                  <span className={`status-badge status-${getStatusClass(dashboardData.approvedUpcoming[0].status)}`}>
                    {statusLabel(dashboardData.approvedUpcoming[0].status)}
                  </span>
                </div>
              )}
            </section>

            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Ticket Status</h2>
                  <p>{tickets.length} submitted ticket{tickets.length !== 1 ? "s" : ""}</p>
                </div>
                <Link to="/tickets/my" className="btn secondary">My tickets</Link>
              </div>
              <div className="dashboard-status-list">
                {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                  <div key={status} className="dashboard-status-row">
                    <span className={`status-badge status-${getStatusClass(status)}`}>{statusLabel(status)}</span>
                    <strong>{tickets.filter((ticket) => ticket.status === status).length}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="dashboard-activity-grid">
            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Recent Tickets</h2>
                  <p>Latest reports you submitted</p>
                </div>
              </div>
              <div className="dashboard-activity-list">
                {dashboardData.recentTickets.length === 0 ? (
                  <p className="subtext">No tickets yet.</p>
                ) : dashboardData.recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="dashboard-activity-item">
                    <div>
                      <strong>{ticket.title}</strong>
                      <span>{formatDateTime(ticket.createdAt)}</span>
                    </div>
                    <span className={`status-badge status-${getStatusClass(ticket.status)}`}>{statusLabel(ticket.status)}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Recent Bookings</h2>
                  <p>Your newest reservations</p>
                </div>
              </div>
              <div className="dashboard-activity-list">
                {dashboardData.recentBookings.length === 0 ? (
                  <p className="subtext">No bookings yet.</p>
                ) : dashboardData.recentBookings.map((booking) => (
                  <Link key={booking.id} to="/bookings" className="dashboard-activity-item">
                    <div>
                      <strong>{booking.resourceName}</strong>
                      <span>{formatDateTime(booking.startTime)}</span>
                    </div>
                    <span className={`status-badge status-${getStatusClass(booking.status)}`}>{statusLabel(booking.status)}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <section className="card dashboard-panel dashboard-resource-strip">
            <div className="dashboard-panel-header">
              <div>
                <h2>Healthy Resources To Book</h2>
                <p>Active spaces and assets with strong health scores</p>
              </div>
              <Link to="/resources" className="btn secondary">Open facilities</Link>
            </div>
            <div className="dashboard-resource-list">
              {dashboardData.suggestedResources.length === 0 ? (
                <p className="subtext">No active resources found.</p>
              ) : dashboardData.suggestedResources.map((resource) => (
                <Link
                  key={resource.id}
                  to={`/bookings/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`}
                  className="dashboard-resource-item"
                >
                  <strong>{resource.name}</strong>
                  <span>{resource.category} · {resource.type?.replaceAll("_", " ")}</span>
                  <em>{resource.healthScore ?? 100}% health</em>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default UserDashboardPage;
