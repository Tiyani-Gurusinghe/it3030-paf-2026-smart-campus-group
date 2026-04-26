import { useState } from "react";
import { updateTicketStatus, updateTicket } from "../../api/ticket/ticketApi";

export default function UserTicketActions({ ticket, onUpdated }) {
  const [notes, setNotes] = useState(ticket.resolutionNotes ?? "");
  const [reopenReason, setReopenReason] = useState("");
  const [newPriority, setNewPriority] = useState(ticket.priority ?? "MEDIUM");
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
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
    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketStatus(ticket.id, { status: "CLOSED" });
      onUpdated(updated);
      setConfirmClose(false);
    } catch (err) {
      setError(err.message || "Failed to close ticket");
    } finally {
      setSaving(false);
    }
  }

  async function handleReopen() {
    const trimmed = reopenReason.trim();
    if (!trimmed) {
      setError("Please provide a reason for re-opening the ticket.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let updated = await updateTicketStatus(ticket.id, { 
        status: "OPEN", 
        rejectedReason: "Re-opened by User: " + trimmed 
      });
      
      if (newPriority !== ticket.priority) {
        updated = await updateTicket(ticket.id, {
          title: ticket.title,
          location: ticket.location,
          category: ticket.category,
          description: ticket.description,
          resourceId: ticket.resourceId,
          requiredSkillId: ticket.requiredSkillId,
          priority: newPriority,
          preferredContact: ticket.preferredContact || "N/A"
        });
      }
      
      onUpdated(updated);
      setShowReopenForm(false);
    } catch (err) {
      setError(err.message || "Failed to re-open ticket");
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

      {canClose && !showReopenForm && (
        <div className="resolution-action-row" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
          <p className="admin-panel-hint">The ticket is marked as resolved. You can close it, or re-open it if the issue persists.</p>
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button className="btn" onClick={() => setConfirmClose(true)} disabled={saving} style={{ flex: 1, backgroundColor: "var(--color-success)" }}>
              Close Ticket
            </button>
            <button className="btn secondary" onClick={() => setShowReopenForm(true)} disabled={saving} style={{ flex: 1 }}>
              Issue Not Fixed? Re-open
            </button>
          </div>
          {confirmClose && (
            <div className="admin-panel-section" style={{ width: "100%" }}>
              <p className="admin-panel-hint" style={{ marginBottom: 8 }}>Close this resolved ticket?</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={handleClose} disabled={saving} style={{ backgroundColor: "var(--color-success)" }}>
                  Confirm Close
                </button>
                <button className="btn secondary" onClick={() => setConfirmClose(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {canClose && showReopenForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Why is this not resolved?</label>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              rows={3}
              placeholder="Explain what is still broken..."
            />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>New Priority</label>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="form-input">
              <option value="LOW">Low priority - Due in 14 days</option>
              <option value="MEDIUM">Medium priority - Due in 5 days</option>
              <option value="HIGH">High priority - Due in 1 day</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button className="btn danger" onClick={handleReopen} disabled={saving || !reopenReason.trim()} style={{ flex: 1 }}>
              Re-open Ticket
            </button>
            <button className="btn secondary" type="button" onClick={() => setShowReopenForm(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
