import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const PRIORITY_COLORS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

const CATEGORY_ICONS = {
  ELECTRICAL: "⚡",
  NETWORK: "🌐",
  PROJECTOR: "📽️",
  FURNITURE: "🪑",
  CLEANING: "🧹",
  OTHER: "📋",
};

export default function TicketList({ tickets, onDelete }) {
  if (!tickets.length) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">🎫</div>
        <h3>No tickets found</h3>
        <p>Create a new ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="ticket-grid">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="card ticket-card">
          <div className="ticket-card-top">
            <h3>
              <span style={{ marginRight: 6 }}>
                {CATEGORY_ICONS[ticket.category] ?? "📋"}
              </span>
              {ticket.title}
            </h3>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="ticket-meta">
            <div className="ticket-meta-item">
              <strong>Location</strong>
              📍 {ticket.location}
            </div>
            <div className="ticket-meta-item">
              <strong>Category</strong>
              {ticket.category}
            </div>
            <div className="ticket-meta-item">
              <strong>Priority</strong>
              <span
                className={`priority-badge priority-badge-${PRIORITY_COLORS[ticket.priority] ?? "medium"}`}
              >
                <span
                  className={`priority-dot priority-dot-${PRIORITY_COLORS[ticket.priority] ?? "medium"}`}
                />
                {ticket.priority}
              </span>
            </div>
            <div className="ticket-meta-item">
              <strong>Assigned To</strong>
              {ticket.assignedTo || (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Unassigned
                </span>
              )}
            </div>
          </div>

          <div className="card-actions">
            <Link to={`/tickets/${ticket.id}`} className="btn secondary">
              View
            </Link>
            <Link to={`/tickets/${ticket.id}/edit`} className="btn">
              Edit
            </Link>
            <button className="btn danger" onClick={() => onDelete(ticket.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}