import useAuth from "../../features/auth/hooks/useAuth";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Sri Lanka Institute of Information Technology</span>
          <h1>Campus Dashboard</h1>
          <p>
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}. Monitor ticket operations,
            bookings, notifications, and facility activity from one workspace.
          </p>
        </div>
        <div className="dashboard-mark">SC</div>
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-stat-card">
          <span>Ticket Desk</span>
          <strong>Live</strong>
          <p>Review maintenance requests and coordinate assignments.</p>
        </div>
        <div className="card dashboard-stat-card">
          <span>Facilities</span>
          <strong>Ready</strong>
          <p>Browse rooms, equipment, and campus assets.</p>
        </div>
        <div className="card dashboard-stat-card">
          <span>Bookings</span>
          <strong>Active</strong>
          <p>Manage reservations and resource schedules.</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
