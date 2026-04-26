import useAuth from "../../features/auth/hooks/useAuth";

function ProfilePage() {
  const { user, roles, primaryRole } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your account details and access information.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Identity sidebar card */}
        <div className="card profile-identity-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials}</div>
          </div>
          <h2 className="profile-name">{user?.fullName ?? "—"}</h2>
          <p className="profile-email">{user?.email ?? "—"}</p>
          <div className="profile-roles">
            {roles.length > 0
              ? roles.map((r) => (
                  <span key={r} className={`role-badge role-badge-${r.toLowerCase()}`}>
                    {r}
                  </span>
                ))
              : <span className="role-badge role-badge-user">USER</span>
            }
          </div>
          <div className="profile-verified-badge">
            <span className="profile-verified-dot" />
            Verified Account
          </div>
        </div>

        {/* Account info card */}
        <div className="card profile-info-card">
          <div className="profile-section-title">Account Information</div>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <div className="profile-info-label">Full Name</div>
              <div className="profile-info-value">{user?.fullName ?? "—"}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Email Address</div>
              <div className="profile-info-value">{user?.email ?? "—"}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">User ID</div>
              <div className="profile-info-value profile-info-mono">{user?.id ?? "—"}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Primary Role</div>
              <div className="profile-info-value">{primaryRole}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">All Roles</div>
              <div className="profile-info-value">{roles.join(", ") || "USER"}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Authentication Status</div>
              <div className="profile-info-value profile-info-verified">
                <span className="profile-verified-dot" />
                Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
