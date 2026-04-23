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

export default function TicketCard({ ticket, linkBase = "/tickets" }) {
  const priority = PRIORITY_LEVEL[ticket.priority] ?? "medium";
  const overdue = isDueOverdue(ticket.dueAt) && !["RESOLVED", "CLOSED"].includes(ticket.status);

  return (
    <div className="card ticket-card">
      <div className="ticket-card-top">
        <h3>{ticket.title}</h3>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="ticket-meta">
        {ticket.resourceName && (
          <div className="ticket-meta-item">
            <strong>Resource</strong>
            {ticket.resourceName}
          </div>
        )}
        {ticket.requiredSkillName && (
          <div className="ticket-meta-item">
            <strong>Skill</strong>
            {ticket.requiredSkillName}
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
              🧑‍🔧 {ticket.assignedToName}
            </span>
          ) : (
            <span className="unassigned-badge">
              ⚠️ Unassigned
            </span>
          )}
        </div>
        {ticket.dueAt && (
          <div className={`ticket-meta-item ${overdue ? "text-danger" : ""}`}>
            <strong>Due</strong>
            {overdue && <span className="due-alert">⚠️ </span>}
            {formatDate(ticket.dueAt)}
          </div>
        )}
      </div>

      <div className="card-actions">
        <Link to={`${linkBase}/${ticket.id}`} className="btn secondary">
          View →
        </Link>
      </div>
    </div>
  );
}
