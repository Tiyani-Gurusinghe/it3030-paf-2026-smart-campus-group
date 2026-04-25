import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAllRead } from "../../api/notification/notificationApi";
import useAuth from "../../features/auth/hooks/useAuth";

function NotificationPanelPage() {
  const { isAdmin, isTechnician } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getTicketPath(referenceId) {
    if (!referenceId) return "/notifications";
    if (isAdmin) return `/admin/tickets/${referenceId}`;
    if (isTechnician) return `/technician/tickets/${referenceId}`;
    return `/tickets/${referenceId}`;
  }

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message || "Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(err.message || "Failed to mark notifications as read");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Recent updates for your tickets and assignments.</p>
        </div>
        {notifications.length > 0 && (
          <button className="btn secondary" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {error && <div className="error-box"><span>Error</span> {error}</div>}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="subtext">No notifications yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              to={getTicketPath(notification.referenceId)}
              className="notification-item"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 16,
                borderRadius: 12,
                background: notification.read ? "transparent" : "var(--bg-hover)",
              }}
            >
              <span className="notification-icon"><img src="/notification.png" alt="" className="notification-bell-icon" /></span>
              <div className="notification-body">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationPanelPage;
