import useAuth from "../../features/auth/hooks/useAuth";

function ProfilePage() {
  const { user, roles, primaryRole } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your signed-in Smart Campus account details.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-item-label">Full Name</div>
            <div className="detail-item-value">{user?.fullName ?? "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Email</div>
            <div className="detail-item-value">{user?.email ?? "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Primary Role</div>
            <div className="detail-item-value">{primaryRole}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">All Roles</div>
            <div className="detail-item-value">{roles.join(", ") || "USER"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">User ID</div>
            <div className="detail-item-value">{user?.id ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
