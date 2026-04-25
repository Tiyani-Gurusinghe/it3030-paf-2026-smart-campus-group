function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes) {
  if (minutes == null) return "Pending";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours ? `${days} d ${remainingHours} hr` : `${days} d`;
}

function isOverdue(ticket) {
  if (!ticket?.dueAt || !["OPEN", "IN_PROGRESS"].includes(ticket.status)) return false;
  return new Date(ticket.dueAt) < new Date();
}

export default function TicketSlaPanel({ ticket }) {
  const overdue = isOverdue(ticket);
  const dueExtended = Boolean(ticket.dueExtendedAt);

  return (
    <div className="details-section">
      <div className="details-section-label">SLA Timing</div>
      <div className="details-grid" style={{ marginTop: 10 }}>
        <div className={`detail-item ${overdue ? "overdue-item" : ""}`}>
          <div className="detail-item-label">Due Time</div>
          <div className="detail-item-value" style={overdue ? { color: "var(--color-danger)" } : {}}>
            {formatDateTime(ticket.dueAt)}{overdue ? " (overdue)" : ""}
          </div>
          {dueExtended && (
            <div className="admin-panel-hint" style={{ marginTop: 6 }}>
              Due date extended by {ticket.dueExtendedByName || "Unknown"}.
            </div>
          )}
        </div>
        {dueExtended && (
          <div className="detail-item">
            <div className="detail-item-label">Original Due Time</div>
            <div className="detail-item-value">{formatDateTime(ticket.originalDueAt)}</div>
          </div>
        )}
        <div className="detail-item">
          <div className="detail-item-label">Time to First Response</div>
          <div className="detail-item-value">{formatDuration(ticket.timeToFirstResponseMinutes)}</div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Time to Resolution</div>
          <div className="detail-item-value">{formatDuration(ticket.timeToResolutionMinutes)}</div>
        </div>
      </div>
      {dueExtended && (
        <p className="admin-panel-hint" style={{ marginTop: 10 }}>
          Due date extended on {formatDateTime(ticket.dueExtendedAt)} by {ticket.dueExtendedByName || "Unknown"}:
          {" "}{ticket.dueExtensionNote || "No note provided."}
        </p>
      )}
      <p className="admin-panel-hint" style={{ marginTop: 10 }}>
        Due time is set when the ticket is created from priority: HIGH is due in 1 day,
        MEDIUM in 5 days, and LOW in 14 days. Overdue status is only counted while the ticket
        is OPEN or IN_PROGRESS. First response is measured from creation to the first admin or
        technician engagement; resolution time is measured from creation to RESOLVED.
      </p>
    </div>
  );
}
