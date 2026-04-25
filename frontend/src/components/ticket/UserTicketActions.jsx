import { useState } from "react";
import { updateTicketStatus } from "../../api/ticket/ticketApi";

export default function UserTicketActions({ ticket, onUpdated }) {
  const [notes, setNotes] = useState(ticket.resolutionNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canResolve = ["OPEN", "IN_PROGRESS"].includes(ticket.status);
  const canClose = ticket.status === "RESOLVED";

  async function handleResolve() {
    const trimmed = notes.trim();
    if (!trimmed) {
      setError("Resolution notes are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketStatus(ticket.id, {
        status: "RESOLVED",
        resolutionNotes: trimmed,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to resolve ticket");
    } finally {
      setSaving(false);
    }
  }

  async function handleClose() {
    if (!window.confirm("Close this resolved ticket?")) return;

    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketStatus(ticket.id, { status: "CLOSED" });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to close ticket");
    } finally {
      setSaving(false);
    }
  }

  if (!canResolve && !canClose) {
    return null;
  }

  return (
    <div className="resolution-panel">
      <div className="resolution-panel-title">Ticket Actions</div>

      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>!</span> {error}
        </div>
      )}

      {canResolve && (
        <>
          <div className="form-field" style={{ marginBottom: 12 }}>
            <label>Resolution Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tell the team why this ticket can be marked resolved..."
            />
          </div>
          <button className="btn" onClick={handleResolve} disabled={saving || !notes.trim()}>
            Mark Resolved
          </button>
        </>
      )}

      {canClose && (
        <div className="resolution-action-row">
          <p className="admin-panel-hint">The ticket is resolved. Close it when no more work is needed.</p>
          <button className="btn" onClick={handleClose} disabled={saving}>
            Close Ticket
          </button>
        </div>
      )}
    </div>
  );
}
