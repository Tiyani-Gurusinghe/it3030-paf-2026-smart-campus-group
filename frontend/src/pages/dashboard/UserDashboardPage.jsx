import useAuth from "../../features/auth/hooks/useAuth";

function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Sri Lanka Institute of Information Technology</span>
          <h1>Campus Dashboard</h1>
          <p>
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}. Use the navigation to manage
            your tickets, bookings, notifications, and campus resources.
          </p>
        </div>
        <div className="dashboard-mark">SC</div>
      </div>
    </div>
  );
}

export default UserDashboardPage;
