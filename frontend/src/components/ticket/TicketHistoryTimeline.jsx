import React from "react";

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

export default function TicketHistoryTimeline({ ticket }) {
  const events = [];

  // 1. Created
  if (ticket.createdAt) {
    events.push({
      id: "created",
      date: new Date(ticket.createdAt),
      type: "CREATED",
      title: "Ticket Created",
      description: `Reported by ${ticket.reportedByName || "User"}`,
      color: "var(--color-primary)",
      icon: "➕"
    });
  }

  // 2. First Response
  if (ticket.firstRespondedAt) {
    events.push({
      id: "responded",
      date: new Date(ticket.firstRespondedAt),
      type: "RESPONDED",
      title: "First Response",
      description: "Staff engagement started",
      color: "var(--priority-medium)",
      icon: "⚡"
    });
  }

  // 3. Due Extended
  if (ticket.dueExtendedAt) {
    events.push({
      id: "extended",
      date: new Date(ticket.dueExtendedAt),
      type: "EXTENDED",
      title: `Due Date Extended by ${ticket.dueExtendedByName || "Admin"}`,
      description: ticket.dueExtensionNote || "No note provided",
      color: "var(--text-muted)",
      icon: "📅"
    });
  }

  // 4. Resolved
  if (ticket.resolvedAt && ticket.resolutionNotes) {
    events.push({
      id: "resolved",
      date: new Date(ticket.resolvedAt),
      type: "RESOLVED",
      title: "Marked as Resolved",
      description: ticket.resolutionNotes,
      color: "var(--status-resolved-text)",
      icon: "✅"
    });
  }

  // 5. Closed
  if (ticket.closedAt) {
    events.push({
      id: "closed",
      date: new Date(ticket.closedAt),
      type: "CLOSED",
      title: "Ticket Closed",
      description: "Issue successfully concluded",
      color: "var(--text-muted)",
      icon: "🔒"
    });
  }

  // 6. Rejected or Re-opened
  if (ticket.rejectedReason) {
    const isReopened = ticket.rejectedReason.startsWith("Re-opened by User");
    const cleanReason = isReopened ? ticket.rejectedReason.replace("Re-opened by User: ", "") : ticket.rejectedReason;
    
    // We don't have a specific reopenedAt/rejectedAt timestamp.
    // To ensure it sorts logically in the timeline:
    // It must have happened after First Response, but before the CURRENT resolution or extension.
    let fakeDateMs = new Date(ticket.createdAt).getTime() + 1000;
    if (ticket.firstRespondedAt) {
      fakeDateMs = new Date(ticket.firstRespondedAt).getTime() + 1000;
    }
    // If there's a resolvedAt, and we want to ensure it shows up before it, we could also use resolvedAt - 1000.
    // But firstRespondedAt + 1000 is safe and guarantees it appears early in the middle.
    
    events.push({
      id: "rejected_reopened",
      date: new Date(fakeDateMs),
      type: isReopened ? "REOPENED" : "REJECTED",
      title: isReopened ? "Re-opened by User" : "Ticket Rejected",
      description: cleanReason,
      color: isReopened ? "var(--color-warning, #d97706)" : "var(--color-danger)",
      icon: isReopened ? "🔄" : "❌"
    });
  }

  // Sort events by date ascending
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  if (events.length === 0) return null;

  return (
    <div className="details-section">
      <div className="details-section-label" style={{ marginBottom: 16 }}>Activity Timeline</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          return (
            <div key={event.id} style={{ display: "flex", gap: 16 }}>
              {/* Timeline graphic */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: "50%", 
                  backgroundColor: "var(--bg-elevated)", 
                  border: `2px solid ${event.color}`, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                  zIndex: 2
                }}>
                  {event.icon}
                </div>
                {!isLast && (
                  <div style={{ width: 2, flex: 1, backgroundColor: "var(--border-strong)", margin: "4px 0" }} />
                )}
              </div>
              
              {/* Event Content */}
              <div style={{ paddingBottom: isLast ? 0 : 24, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {(event.type === "REOPENED" || event.type === "REJECTED") 
                      ? "Subsequent Action" 
                      : formatDateTime(event.date)}
                  </div>
                </div>
                <div style={{ 
                  marginTop: 6, 
                  padding: "10px 14px", 
                  backgroundColor: "var(--bg-subtle, #f8f9fa)", 
                  borderRadius: "var(--radius-md)", 
                  fontSize: 14, 
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)"
                }}>
                  {event.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
