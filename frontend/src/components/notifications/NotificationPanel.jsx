import { useEffect, useRef, useState } from "react";
import { getNotifications, getUnreadCount, markAllRead } from "../../api/notification/notificationApi";
import { Link } from "react-router-dom";

const TYPE_ICONS = {
  TICKET_STATUS_CHANGED: "🔄",
  NEW_COMMENT: "💬",
  TICKET_ASSIGNED: "👤",
  TICKET_UPDATED: "📝",
  BOOKING_APPROVED: "✅",
  BOOKING_REJECTED: "❌",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef();

  const refreshUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  useEffect(() => {
    void getUnreadCount().then(setUnreadCount);
    const interval = setInterval(refreshUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    if (!open) {
      const data = await getNotifications();
      setNotifications(data);
    }
    setOpen((v) => !v);
  }

  async function handleMarkAllRead() {
    await markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="notification-wrapper" ref={panelRef}>
      <button className="notification-bell" onClick={handleOpen} aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notification-mark-read" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>🎉 You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.referenceId ? `/tickets/${n.referenceId}` : "/notifications"}
                  className={`notification-item ${!n.read ? "unread" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="notification-icon">{TYPE_ICONS[n.type] ?? "📢"}</span>
                  <div className="notification-body">
                    <p className="notification-title">{n.title}</p>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && <span className="notification-dot" />}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
