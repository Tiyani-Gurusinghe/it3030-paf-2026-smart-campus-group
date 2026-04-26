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

  return (
    <div className="details-section">
      <div className="details-section-label">SLA Timing</div>
      <div className="details-grid" style={{ marginTop: 10 }}>
        <div className={`detail-item ${overdue ? "overdue-item" : ""}`}>
          <div className="detail-item-label">Due Time</div>
          <div className="detail-item-value" style={overdue ? { color: "var(--color-danger)" } : {}}>
            {formatDateTime(ticket.dueAt)}{overdue ? " (overdue)" : ""}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Time to First Response</div>
          <div className="detail-item-value">{formatDuration(ticket.timeToFirstResponseMinutes)}</div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Time to Resolution</div>
          <div className="detail-item-value">{formatDuration(ticket.timeToResolutionMinutes)}</div>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 16, backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--color-primary)' }}>ℹ</span> SLA Guidelines
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <strong style={{ display: 'block', marginBottom: 4, color: 'var(--text-primary)' }}>Priority Windows</strong>
            <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
              <li><strong>HIGH:</strong> 1 day</li>
              <li><strong>MEDIUM:</strong> 5 days</li>
              <li><strong>LOW:</strong> 14 days</li>
            </ul>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: 4, color: 'var(--text-primary)' }}>Time Tracking</strong>
            <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
              <li><strong>Overdue:</strong> Counted only when OPEN or IN PROGRESS</li>
              <li><strong>First Response:</strong> From creation to first staff engagement</li>
              <li><strong>Resolution:</strong> From creation to RESOLVED status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
