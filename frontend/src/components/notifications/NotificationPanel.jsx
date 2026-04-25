import { useEffect, useRef, useState } from "react";
import { getNotifications, getUnreadCount, markAllRead } from "../../api/notification/notificationApi";
import { Link } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";

const TYPE_ICONS = {
  TICKET_STATUS_CHANGED: "ST",
  NEW_COMMENT: "CM",
  TICKET_ASSIGNED: "AS",
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
  const { isAdmin, isTechnician } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef();

  function getTicketPath(referenceId) {
    if (!referenceId) return "/notifications";
    if (isAdmin) return `/admin/tickets/${referenceId}`;
    if (isTechnician) return `/technician/tickets/${referenceId}`;
    return `/tickets/${referenceId}`;
  }

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
        <img src="/notification.png" alt="" className="notification-bell-icon" />
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
                <p>You are all caught up.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={getTicketPath(n.referenceId)}
                  className={`notification-item ${!n.read ? "unread" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="notification-icon">{TYPE_ICONS[n.type] ?? "NT"}</span>
                  <div className="notification-body">
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
