import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicketById } from "../../api/ticket/ticketApi";
import StatusBadge from "../../components/ticket/StatusBadge";
import TicketAssignmentPanel from "../../components/ticket/TicketAssignmentPanel";
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

export default function AdminTicketDetailPage() {
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
        <div className="error-box"><span>⚠️</span> {error}</div>
        <Link to="/admin/tickets" className="btn secondary" style={{ marginTop: 12 }}>← Back</Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          <div className="skeleton-card" style={{ height: 600, gridColumn: "1 / -1" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card details-card">

        {/* Header */}
        <div className="details-header">
          <div>
            <div className="role-badge-inline role-badge-admin">ADMIN VIEW</div>
            <h1 className="details-title">{ticket.title}</h1>
            {ticket.resourceName && (
              <p className="details-location">
                📦 {ticket.resourceName} {ticket.resourceType ? `(${ticket.resourceType})` : ""}
              </p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <StatusBadge status={ticket.status} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>ID: #{ticket.id}</span>
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
              {ticket.assignedToName ?? (
                <span className="badge-unassigned">Unassigned</span>
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Reported By</div>
            <div className="detail-item-value">{ticket.reportedByName ?? "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Required Skill</div>
            <div className="detail-item-value">{ticket.requiredSkillName ?? "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Due At</div>
            <div className="detail-item-value">{formatDate(ticket.dueAt)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Created</div>
            <div className="detail-item-value">{formatDate(ticket.createdAt)}</div>
          </div>
          {ticket.resolvedAt && (
            <div className="detail-item">
              <div className="detail-item-label">Resolved At</div>
              <div className="detail-item-value">{formatDate(ticket.resolvedAt)}</div>
            </div>
          )}
          {ticket.closedAt && (
            <div className="detail-item">
              <div className="detail-item-label">Closed At</div>
              <div className="detail-item-value">{formatDate(ticket.closedAt)}</div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="details-section">
          <div className="details-section-label">Description</div>
          <p>{ticket.description || "No description."}</p>
        </div>

        <hr className="details-section-divider" />

        {/* Resolution Notes */}
        {ticket.resolutionNotes && (
          <>
            <div className="details-section">
              <div className="details-section-label">✅ Resolution Notes</div>
              <p>{ticket.resolutionNotes}</p>
            </div>
            <hr className="details-section-divider" />
          </>
        )}

        {/* Rejected Reason */}
        {ticket.rejectedReason && (
          <>
            <div className="details-section">
              <div className="details-section-label" style={{ color: "var(--color-danger)" }}>✕ Rejection Reason</div>
              <p>{ticket.rejectedReason}</p>
            </div>
            <hr className="details-section-divider" />
          </>
        )}

        {/* Admin Controls */}
        <TicketAssignmentPanel
          ticket={ticket}
          onUpdated={(updated) => setTicket(updated)}
        />

        <hr className="details-section-divider" />

        {/* Attachments */}
        <AttachmentsSection ticketId={ticket.id} canUpload={true} />

        <hr className="details-section-divider" />

        {/* Comments — admin can edit/delete any */}
        <CommentsSection ticketId={ticket.id} canCommentAsAdmin={true} />

        {/* Back */}
        <div className="card-actions">
          <Link to="/admin/tickets" className="btn secondary">← Back to All Tickets</Link>
        </div>
      </div>
    </div>
  );
}
