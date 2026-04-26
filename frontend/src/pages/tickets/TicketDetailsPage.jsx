import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getTicketById } from "../../api/ticket/ticketApi";
import StatusBadge from "../../components/ticket/StatusBadge";
import TicketSlaPanel from "../../components/ticket/TicketSlaPanel";
import TicketHistoryTimeline from "../../components/ticket/TicketHistoryTimeline";
import UserTicketActions from "../../components/ticket/UserTicketActions";
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

function isDueOverdue(dueAt) {
  if (!dueAt) return false;
  return new Date(dueAt) < new Date();
}

function hasDisplayValue(value) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        <Link to="/tickets/my" className="btn secondary" style={{ marginTop: 12 }}>Back</Link>
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

  const overdue = isDueOverdue(ticket.dueAt) && ["OPEN", "IN_PROGRESS"].includes(ticket.status);
  const hasRequiredSkill = hasDisplayValue(ticket.requiredSkillName);
  const hasPreferredContact = hasDisplayValue(ticket.preferredContactDetails);

  return (
    <div className="page">
      <div className="form-layout-wrapper">
        <button onClick={() => navigate(-1)} className="btn-back btn-back-floating">
          Back
        </button>
        <div className="card details-card">

        {/* Header */}
        <div className="details-header">
          <div>
            <h1 className="details-title">{ticket.title}</h1>
            {ticket.resourceName && (
              <p className="details-location">{ticket.resourceName} {ticket.resourceType ? `(${ticket.resourceType})` : ""}</p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <StatusBadge status={ticket.status} />
            {ticket.commentCount > 0 && (
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {ticket.commentCount} comment{ticket.commentCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
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
            <div className="detail-item-label">Assigned To</div>
            <div className="detail-item-value">
              {ticket.assignedToName ?? <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Unassigned</span>}
            </div>
          </div>

          {hasPreferredContact && (
            <div className="detail-item">
              <div className="detail-item-label">Preferred Contact</div>
              <div className="detail-item-value">{ticket.preferredContactDetails}</div>
            </div>
          )}
          <div className={`detail-item ${overdue ? "overdue-item" : ""}`}>
            <div className="detail-item-label">Due At {overdue && "(overdue)"}</div>
            <div className="detail-item-value" style={overdue ? { color: "var(--color-danger)" } : {}}>
              {formatDate(ticket.dueAt)}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Submitted</div>
            <div className="detail-item-value">{formatDate(ticket.createdAt)}</div>
          </div>
        </div>

        <TicketSlaPanel ticket={ticket} />

        <hr className="details-section-divider" />

        {/* Description */}
        <div className="details-section">
          <div className="details-section-label">Description</div>
          <p>{ticket.description || "No description."}</p>
        </div>

        <hr className="details-section-divider" />

        <UserTicketActions
          ticket={ticket}
          onUpdated={(updated) => setTicket(updated)}
        />

        {["OPEN", "IN_PROGRESS", "RESOLVED"].includes(ticket.status) && (
          <hr className="details-section-divider" />
        )}

        {/* History Timeline */}
        <TicketHistoryTimeline ticket={ticket} />
        <hr className="details-section-divider" />

        {/* Attachments */}
        <AttachmentsSection ticketId={ticket.id} canUpload={true} />

        <hr className="details-section-divider" />

        {/* Comments */}
        <CommentsSection ticketId={ticket.id} />

        {/* Actions */}
        <div className="card-actions">
          <button onClick={() => navigate(-1)} className="btn secondary">Back to List</button>
        </div>
      </div>
      </div>
    </div>
  );
}
