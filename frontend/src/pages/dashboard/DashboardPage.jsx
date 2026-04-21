import useAuth from "../../features/auth/hooks/useAuth";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Dashboard</h1>
          <p className="page-subtitle">
            Admin workspace for monitoring ticket operations across campus.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 10 }}>Welcome{user?.fullName ? `, ${user.fullName}` : ""}</h2>
        <p className="subtext">
          Use the sidebar to review all tickets, manage assignments, and track notifications.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
