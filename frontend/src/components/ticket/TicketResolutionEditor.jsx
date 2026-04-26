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
        <div className="resolution-panel-title">Resolution Notes</div>
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
      <div className="resolution-panel-title">Work Panel</div>

      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>Error</span> {error}
        </div>
      )}

      {canStart && (
        <div className="resolution-action-row">
          <p className="admin-panel-hint">Claim this ticket and start working on it.</p>
          <button className="btn" onClick={handleStartWork} disabled={saving}>
            Start Work
          </button>
        </div>
      )}

      {canResolve && (
        <div style={{ backgroundColor: "var(--bg-elevated)", padding: 20, borderRadius: "var(--radius-lg)", marginBottom: 20, border: "1px solid var(--border-color)" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Resolve Ticket</h4>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Describe what was done to resolve the issue..."
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "12px", width: "100%", fontSize: "14px", color: "var(--text-primary)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              className="btn secondary"
              onClick={handleSaveNotes}
              disabled={saving || !notes.trim()}
              style={{ padding: "10px 20px", fontWeight: 600 }}
            >
              Save Draft Notes
            </button>
            <button
              className="btn"
              onClick={handleMarkResolved}
              disabled={saving || !notes.trim()}
              style={{ backgroundColor: "var(--status-resolved-text)", padding: "10px 20px", fontWeight: 600, color: "white" }}
            >
              Mark as Resolved
            </button>
          </div>
        </div>
      )}

      <TicketDueDateExtensionPanel ticket={ticket} onUpdated={onUpdated} />
    </div>
  );
}
