import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const PRIORITY_LEVEL = { LOW: "low", MEDIUM: "medium", HIGH: "high" };

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function isDueOverdue(dueAt) {
  if (!dueAt) return false;
  return new Date(dueAt) < new Date();
}

export default function TicketCard({ ticket, linkBase = "/tickets", onDelete = null }) {
  const priority = PRIORITY_LEVEL[ticket.priority] ?? "medium";
  const overdue = isDueOverdue(ticket.dueAt) && ["OPEN", "IN_PROGRESS"].includes(ticket.status);

  return (
    <div className="card ticket-card" title={ticket.title}>
      <div className="ticket-card-top">
        <h3 className="ticket-card-title" title={ticket.title}>
          {ticket.title}
        </h3>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="ticket-meta">
        {ticket.resourceName && (
          <div className="ticket-meta-item">
            <strong>Resource</strong>
            {ticket.resourceName}
          </div>
        )}

        <div className="ticket-meta-item">
          <strong>Priority</strong>
          <span className={`priority-badge priority-badge-${priority}`}>
            <span className={`priority-dot priority-dot-${priority}`} />
            {ticket.priority}
          </span>
        </div>
        <div className="ticket-meta-item">
          <strong>Assigned To</strong>
          {ticket.assignedToName ? (
            <span className="assignee-badge">
              {ticket.assignedToName}
            </span>
          ) : (
            <span className="unassigned-badge">
              Unassigned
            </span>
          )}
        </div>
        {ticket.dueAt && (
          <div className="ticket-meta-item">
            <strong>Due</strong>
            <span style={{ 
              color: ticket.dueExtendedAt ? "var(--sliit-orange)" : (overdue ? "#dc2626" : "var(--sliit-blue)"), 
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              {ticket.dueExtendedAt ? "Extended:" : (overdue ? "Overdue:" : "")} {formatDate(ticket.dueAt)}
            </span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <Link to={`${linkBase}/${ticket.id}`} className="btn secondary">
          View / Edit
        </Link>
        {onDelete && (
          <button type="button" className="btn danger" onClick={() => onDelete(ticket.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
