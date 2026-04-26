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
    <div className="admin-panel-section">
      <label className="admin-panel-label">Extend Due Date</label>
      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>!</span> {error}
        </div>
      )}
      <div className="admin-inline" style={{ alignItems: "flex-start" }}>
        <input
          type="datetime-local"
          className="admin-input"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          min={initialDueAt}
          disabled={saving}
        />
        <button className="btn" onClick={handleExtend} disabled={saving || !dueAt || !note.trim()}>
          Extend
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Reason for extending the due date..."
        style={{ marginTop: 10 }}
        disabled={saving}
      />
      <p className="admin-panel-hint">
        The new due date must be later than the current due date, and the note will be shown on the ticket.
      </p>
    </div>
  );
}
