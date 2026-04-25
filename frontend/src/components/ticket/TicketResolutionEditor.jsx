import { useState } from "react";
import { updateTicketStatus, updateTicketResolution } from "../../api/ticket/ticketApi";
import TicketDueDateExtensionPanel from "./TicketDueDateExtensionPanel";

export default function TicketResolutionEditor({ ticket, onUpdated }) {
  const [notes, setNotes] = useState(ticket.resolutionNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canStart = ticket.status === "OPEN";
  const canResolve = ticket.status === "IN_PROGRESS";
  const isTerminal = ["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status);

  async function handleStartWork() {
    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketStatus(ticket.id, { status: "IN_PROGRESS" });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkResolved() {
    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketStatus(ticket.id, {
        status: "RESOLVED",
        resolutionNotes: notes.trim() || undefined,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to mark resolved");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotes() {
    if (!notes.trim()) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketResolution(ticket.id, {
        resolutionNotes: notes.trim(),
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to save notes");
    } finally {
      setSaving(false);
    }
  }

  if (isTerminal) {
    return (
      <div className="resolution-panel">
        <div className="resolution-panel-title">📝 Resolution Notes</div>
        <p className="resolution-notes-text">
          {ticket.resolutionNotes || (
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              No resolution notes.
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="resolution-panel">
      <div className="resolution-panel-title">🔧 Work Panel</div>

      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {canStart && (
        <div className="resolution-action-row">
          <p className="admin-panel-hint">Claim this ticket and start working on it.</p>
          <button className="btn" onClick={handleStartWork} disabled={saving}>
            ▶ Start Work
          </button>
        </div>
      )}

      {canResolve && (
        <>
          <div className="form-field" style={{ marginBottom: 12 }}>
            <label>Resolution Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Describe what was done to resolve the issue..."
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn secondary"
              onClick={handleSaveNotes}
              disabled={saving || !notes.trim()}
            >
              💾 Save Notes
            </button>
            <button
              className="btn"
              onClick={handleMarkResolved}
              disabled={saving}
            >
              ✅ Mark Resolved
            </button>
          </div>
        </>
      )}

      <TicketDueDateExtensionPanel ticket={ticket} onUpdated={onUpdated} />
    </div>
  );
}
