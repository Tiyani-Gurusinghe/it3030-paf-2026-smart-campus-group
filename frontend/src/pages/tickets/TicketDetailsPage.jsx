import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicket, updateTicketStatus } from "../../api/ticket/ticketApi";
import StatusBadge from "../../components/ticket/StatusBadge";

const CATEGORY_ICONS = {
  ELECTRICAL: "⚡",
  NETWORK: "🌐",
  PROJECTOR: "📽️",
  FURNITURE: "🪑",
  CLEANING: "🧹",
  OTHER: "📋",
};

const PRIORITY_COLORS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err.message || "Failed to load ticket");
      }
    }
    loadTicket();
  }, [id]);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    try {
      setSaving(true);
      const updated = await updateTicketStatus(id, {
        status: newStatus,
        assignedTo: ticket.assignedTo || "",
        resolutionNotes: ticket.resolutionNotes || "",
      });
      setTicket(updated);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-box">
          <span>⚠️</span> {error}
        </div>
        <Link to="/tickets" className="btn secondary" style={{ marginTop: 12 }}>
          ← Back to Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          <div className="skeleton-card" style={{ height: 400, gridColumn: "1 / -1" }} />
        </div>
      </div>
    );
  }

  const categoryIcon = CATEGORY_ICONS[ticket.category] ?? "📋";
  const priorityLevel = PRIORITY_COLORS[ticket.priority] ?? "medium";

  return (
    <div className="page">
      <div className="card details-card">
        {/* Header */}
        <div className="details-header">
          <div>
            <h1 className="details-title">
              {categoryIcon} {ticket.title}
            </h1>
            <p className="details-location">📍 {ticket.location}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Meta Grid */}
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-item-label">Category</div>
            <div className="detail-item-value">{categoryIcon} {ticket.category}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Priority</div>
            <div className="detail-item-value">
              <span className={`priority-badge priority-badge-${priorityLevel}`}>
                <span className={`priority-dot priority-dot-${priorityLevel}`} style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 6 }} />
                {ticket.priority}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Preferred Contact</div>
            <div className="detail-item-value">{ticket.preferredContact || "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Assigned To</div>
            <div className="detail-item-value">
              {ticket.assignedTo || (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Unassigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="details-section">
          <div className="details-section-label">Description</div>
          <p>{ticket.description || "No description provided."}</p>
        </div>

        <hr className="details-section-divider" />

        {/* Resolution Notes */}
        <div className="details-section">
          <div className="details-section-label">Resolution Notes</div>
          <p>
            {ticket.resolutionNotes || (
              <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No resolution notes yet.
              </span>
            )}
          </p>
        </div>

        <hr className="details-section-divider" />

        {/* Status Update */}
        <div className="status-update-section">
          <label htmlFor="status">Update Status</label>
          <select
            id="status"
            className="status-select"
            value={ticket.status}
            onChange={handleStatusChange}
            disabled={saving}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {saving && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              ⏳ Updating status...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="card-actions">
          <Link to="/tickets" className="btn secondary">
            ← Back
          </Link>
          <Link to={`/tickets/${ticket.id}/edit`} className="btn">
            ✏️ Edit Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}