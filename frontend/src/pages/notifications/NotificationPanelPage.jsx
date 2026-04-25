import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAllRead } from "../../api/notification/notificationApi";

const TYPE_ICONS = {
  TICKET_STATUS_CHANGED: "🔄",
  NEW_COMMENT: "💬",
  TICKET_ASSIGNED: "👤",
  TICKET_UPDATED: "📝",
  BOOKING_APPROVED: "✅",
  BOOKING_REJECTED: "❌",
};

function NotificationPanelPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <p className="page-subtitle">Recent updates for your tickets, bookings, and assignments.</p>
        </div>
        {notifications.length > 0 && (
          <button className="btn secondary" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {error && <div className="error-box"><span>⚠️</span> {error}</div>}

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
              to={notification.referenceId ? `/tickets/${notification.referenceId}` : "/notifications"}
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
              <span className="notification-icon">{TYPE_ICONS[notification.type] ?? "📢"}</span>
              <div className="notification-body">
                <p className="notification-title" style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>{notification.title}</p>
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
