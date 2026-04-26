import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicketById } from "../../api/ticket/ticketApi";
import StatusBadge from "../../components/ticket/StatusBadge";
import TicketResolutionEditor from "../../components/ticket/TicketResolutionEditor";
import TicketHistoryTimeline from "../../components/ticket/TicketHistoryTimeline";
import TicketSlaPanel from "../../components/ticket/TicketSlaPanel";
import {
  CommentsSection,
  AttachmentsSection,
} from "../../components/ticket/TicketDetailSections";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TechnicianTicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTicketById(id)
      .then(setTicket)
      .catch((err) => setError(err.message || "Failed to load ticket"));
  }, [id]);

  if (error) {
    return (
      <div className="page">
        <div className="error-box"><span>Error</span> {error}</div>
        <Link to="/technician/tickets" className="btn secondary" style={{ marginTop: 12 }}>Back</Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          <div className="skeleton-card" style={{ height: 500, gridColumn: "1 / -1" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-layout-wrapper">
        <button onClick={() => window.history.back()} className="btn-back btn-back-floating">
          Back
        </button>
        <div className="card details-card">

          {/* Header */}
          <div className="details-header">
            <div>
              <h1 className="details-title">{ticket.title}</h1>
              {ticket.resourceName && (
                <p className="details-location">{ticket.resourceName}</p>
              )}
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          {/* Meta Grid */}
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-item-label">Priority</div>
              <div className="detail-item-value">
                <span className={`priority-badge priority-badge-${(ticket.priority ?? "MEDIUM").toLowerCase()}`}>
                  <span className={`priority-dot priority-dot-${(ticket.priority ?? "MEDIUM").toLowerCase()}`} />
                  {ticket.priority ?? "—"}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Reported By</div>
              <div className="detail-item-value">{ticket.reportedByName ?? "—"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Due At</div>
              <div className="detail-item-value">{formatDate(ticket.dueAt)}</div>
            </div>
          </div>

        <TicketSlaPanel ticket={ticket} />

        <hr className="details-section-divider" />

        {/* Description */}
        <div className="details-section">
          <div className="details-section-label">Description</div>
          <p>{ticket.description || "No description."}</p>
        </div>

        {/* History Timeline */}
        <TicketHistoryTimeline ticket={ticket} />
        <hr className="details-section-divider" />

        {/* Work Panel */}
        <TicketResolutionEditor
          ticket={ticket}
          onUpdated={(updated) => setTicket(updated)}
        />

        <hr className="details-section-divider" />

        {/* Attachments */}
        <AttachmentsSection ticketId={ticket.id} canUpload={true} />

        <hr className="details-section-divider" />

        {/* Comments */}
        <CommentsSection ticketId={ticket.id} />

        {/* Back */}
        <div className="card-actions">
          <button onClick={() => window.history.back()} className="btn secondary">Back to Assigned Tickets</button>
        </div>
      </div>
      </div>
    </div>
  );
}
