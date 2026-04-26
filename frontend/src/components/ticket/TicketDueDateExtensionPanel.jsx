import { useMemo, useState } from "react";
import { updateTicketDueDate } from "../../api/ticket/ticketApi";

function toDateTimeLocalValue(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toApiLocalDateTime(value) {
  return value ? `${value}:00` : "";
}

export default function TicketDueDateExtensionPanel({ ticket, onUpdated }) {
  const initialDueAt = useMemo(() => toDateTimeLocalValue(ticket.dueAt), [ticket.dueAt]);
  const [dueAt, setDueAt] = useState(initialDueAt);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canExtend = ["OPEN", "IN_PROGRESS"].includes(ticket.status);

  async function handleExtend() {
    if (!dueAt) {
      setError("New due date is required.");
      return;
    }
    if (!note.trim()) {
      setError("Extension note is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await updateTicketDueDate(ticket.id, {
        dueAt: toApiLocalDateTime(dueAt),
        note: note.trim(),
      });
      onUpdated(updated);
      setNote("");
    } catch (err) {
      setError(err.message || "Failed to extend due date");
    } finally {
      setSaving(false);
    }
  }

  if (!canExtend) {
    return null;
  }

  return (
    <div style={{ backgroundColor: "var(--bg-elevated)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
      <h4 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Extend Due Date</h4>
      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>!</span> {error}
        </div>
      )}
      <div className="admin-inline" style={{ alignItems: "flex-start", gap: 12 }}>
        <input
          type="datetime-local"
          className="admin-input"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          min={initialDueAt}
          disabled={saving}
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "10px 12px", flex: 1, fontSize: "14px", color: "var(--text-primary)" }}
        />
        <button className="btn secondary" onClick={handleExtend} disabled={saving || !dueAt || !note.trim()} style={{ padding: "10px 20px", fontWeight: 600 }}>
          Apply Extension
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Reason for extending the due date..."
        style={{ marginTop: 12, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "12px", width: "100%", fontSize: "14px", color: "var(--text-primary)" }}
        disabled={saving}
      />
      <p className="admin-panel-hint" style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
        The new due date must be later than the current due date, and the note will be shown on the ticket.
      </p>
    </div>
  );
}
