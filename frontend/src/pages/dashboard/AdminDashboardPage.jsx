import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";
import { getAdminDashboardSummary } from "../../features/admin/api/adminDashboardApi";

const statusLabel = (status) => status.replaceAll("_", " ").toLowerCase();

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
  if (status === "APPROVED" || status === "RESOLVED" || status === "COMPLETED") return "resolved";
  if (status === "REJECTED" || status === "CANCELLED") return "rejected";
  if (status === "IN_PROGRESS" || status === "PENDING") return "pending";
  return "open";
};

function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(isAdmin);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    let ignore = false;

    getAdminDashboardSummary()
      .then((data) => {
        if (!ignore) setSummary(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Failed to load dashboard summary.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const headlineStats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Pending Bookings",
        value: summary.bookingStats.pending,
        copy: "Requests waiting for admin approval.",
        tone: "orange",
        to: "/bookings",
      },
      {
        label: "Open Tickets",
        value: summary.ticketStats.byStatus.OPEN || 0,
        copy: "Maintenance issues that need triage.",
        tone: "blue",
        to: "/admin/tickets",
      },
      {
        label: "Overdue Tickets",
        value: summary.ticketStats.overdue,
        copy: "Open work that passed its due time.",
        tone: "red",
        to: "/admin/tickets",
      },
      {
        label: "Active Resources",
        value: summary.resourceStats.active,
        copy: "Facilities and assets currently available.",
        tone: "green",
        to: "/resources",
      },
    ];
  }, [summary]);



  return (
    <div className="page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Admin Command Center</span>
          <h1>Smart Campus Dashboard</h1>
          <p>
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}. Monitor operational load,
            approve bookings, track ticket risk, and review campus resource health.
          </p>
        </div>
        <div className="dashboard-mark">SC</div>
      </div>

      {error && <div className="error-box dashboard-alert">{error}</div>}

      {loading ? (
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton-card" />
          ))}
        </div>
      ) : summary ? (
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

          <div className="dashboard-panel-grid">
            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Ticket Operations</h2>
                  <p>{summary.ticketStats.total} total tickets</p>
                </div>
                <Link to="/admin/tickets" className="btn secondary">View tickets</Link>
              </div>
              <div className="dashboard-status-list">
                {Object.entries(summary.ticketStats.byStatus).map(([status, count]) => (
                  <div key={status} className="dashboard-status-row">
                    <span className={`status-badge status-${getStatusClass(status)}`}>{statusLabel(status)}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
              <div className="dashboard-inline-metrics">
                <span>{summary.ticketStats.unassigned} unassigned</span>
                <span>{summary.ticketStats.overdue} overdue</span>
              </div>
            </section>

            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Bookings</h2>
                  <p>{summary.bookingStats.total} total reservations</p>
                </div>
                <Link to="/bookings" className="btn secondary">Review bookings</Link>
              </div>
              <div className="dashboard-status-list">
                {Object.entries(summary.bookingStats.byStatus).map(([status, count]) => (
                  <div key={status} className="dashboard-status-row">
                    <span className={`status-badge status-${getStatusClass(status)}`}>
                      {status === "REJECTED" ? "declined" : statusLabel(status)}
                    </span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Resource Health</h2>
                  <p>{summary.resourceStats.total} registered resources</p>
                </div>
                <Link to="/resources" className="btn secondary">Open catalogue</Link>
              </div>
              <div className="dashboard-status-list">
                {Object.entries(summary.resourceStats.byStatus).map(([status, count]) => (
                  <div key={status} className="dashboard-status-row">
                    <span>{statusLabel(status)}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>People</h2>
                  <p>{summary.userStats.total} platform users</p>
                </div>
              </div>
              <div className="dashboard-status-list">
                <div className="dashboard-status-row"><span>Admins</span><strong>{summary.userStats.admins}</strong></div>
                <div className="dashboard-status-row"><span>Technicians</span><strong>{summary.userStats.technicians}</strong></div>
                <div className="dashboard-status-row"><span>Users</span><strong>{summary.userStats.users}</strong></div>
              </div>
            </section>
          </div>

          <div className="dashboard-activity-grid">
            <section className="card dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Recent Tickets</h2>
                  <p>Latest maintenance reports</p>
                </div>
              </div>
              <div className="dashboard-activity-list">
                {summary.recentTickets.length === 0 ? (
                  <p className="subtext">No recent tickets.</p>
                ) : summary.recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`} className="dashboard-activity-item">
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
                  <p>Newest resource reservations</p>
                </div>
              </div>
              <div className="dashboard-activity-list">
                {summary.recentBookings.length === 0 ? (
                  <p className="subtext">No recent bookings.</p>
                ) : summary.recentBookings.map((booking) => (
                  <Link key={booking.id} to="/bookings" className="dashboard-activity-item">
                    <div>
                      <strong>{booking.resourceName}</strong>
                      <span>{booking.userName} · {formatDateTime(booking.startTime)}</span>
                    </div>
                    <span className={`status-badge status-${getStatusClass(booking.status)}`}>
                      {booking.status === "REJECTED" ? "declined" : statusLabel(booking.status)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default AdminDashboardPage;
