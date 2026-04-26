import useAuth from "../../features/auth/hooks/useAuth";
import { Link } from "react-router-dom";

function TechnicianDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Maintenance & Operations</span>
          <h1>Technician Dashboard</h1>
          <p>
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}. View your assigned tickets,
            resolve campus issues, and monitor notifications.
          </p>
        </div>
        <div className="dashboard-mark">SC</div>
      </div>

      <div className="dashboard-grid dashboard-grid-four">
        <Link to="/technician/tickets" className="card dashboard-stat-card dashboard-stat-blue">
          <span>Assigned Tickets</span>
          <strong>View</strong>
          <p>Check tickets assigned to you.</p>
        </Link>
        <Link to="/notifications" className="card dashboard-stat-card dashboard-stat-orange">
          <span>Notifications</span>
          <strong>Alerts</strong>
          <p>Recent updates to your tasks.</p>
        </Link>
        <Link to="/resources" className="card dashboard-stat-card dashboard-stat-green">
          <span>Campus Facilities</span>
          <strong>Browse</strong>
          <p>Locate resources for your tasks.</p>
        </Link>
        <Link to="/profile" className="card dashboard-stat-card dashboard-stat-purple">
          <span>Profile & Skills</span>
          <strong>Manage</strong>
          <p>Update your technician profile.</p>
        </Link>
      </div>
    </div>
  );
}

export default TechnicianDashboardPage;
