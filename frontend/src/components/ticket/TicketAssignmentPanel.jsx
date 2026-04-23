import { useEffect, useState } from "react";
import {
  assignTicket,
  rejectTicket,
  closeTicket,
  getAssignableTechnicians,
} from "../../api/ticket/ticketApi";

export default function TicketAssignmentPanel({ ticket, onUpdated }) {
  const [assignTo, setAssignTo] = useState(ticket.assignedTo ? String(ticket.assignedTo) : "");
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAssignTo(ticket.assignedTo ? String(ticket.assignedTo) : "");
  }, [ticket.assignedTo]);

  useEffect(() => {
    let active = true;

    async function loadTechnicians() {
      setLoadingTechnicians(true);
      setError("");
      try {
        const data = await getAssignableTechnicians(ticket.id);
        if (!active) {
          return;
        }

        const options = Array.isArray(data) ? data : [];
        setTechnicians(options);

        if (assignTo && !options.some((t) => String(t.id) === String(assignTo))) {
          setAssignTo("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load technicians");
          setTechnicians([]);
        }
      } finally {
        if (active) {
          setLoadingTechnicians(false);
        }
      }
    }

    loadTechnicians();

    return () => {
      active = false;
    };
  }, [ticket.id, ticket.requiredSkillId]);

  async function handleAssign() {
    if (!assignTo.trim()) {
      setError("Please select a technician.");
      return;
    }
    if (!technicians.some((t) => String(t.id) === String(assignTo))) {
      setError("Selected technician is not valid for this ticket.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await assignTicket(ticket.id, { assignedTo: Number(assignTo) });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to assign ticket");
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Rejection reason is required.");
      return;
    }
    if (reason.length < 10) {
      setError("Rejection reason must be at least 10 characters.");
      return;
    }
    if (reason.length > 4000) {
      setError("Rejection reason must be at most 4000 characters.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await rejectTicket(ticket.id, { rejectedReason: reason });
      onUpdated(updated);
      setShowRejectForm(false);
    } catch (err) {
      setError(err.message || "Failed to reject ticket");
    } finally {
      setSaving(false);
    }
  }

  async function handleClose() {
    if (!window.confirm("Close this ticket? This marks it as completed.")) return;
    setSaving(true);
    setError("");
    try {
      const updated = await closeTicket(ticket.id);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to close ticket");
    } finally {
      setSaving(false);
    }
  }

  const canClose = ticket.status === "RESOLVED";
  const isRejectedOrClosed = ["REJECTED", "CLOSED"].includes(ticket.status);

  return (
    <div className="admin-panel">
      <div className="admin-panel-title">🔧 Admin Controls</div>

      {error && (
        <div className="error-box" style={{ marginBottom: 16 }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Assign */}
      {!isRejectedOrClosed && (
        <div className="admin-panel-section">
          <label className="admin-panel-label">
            {ticket.assignedTo ? "Reassign Technician" : "Assign Technician"}
          </label>
          <div className="admin-inline">
            <select
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="admin-input"
              disabled={loadingTechnicians || saving || technicians.length === 0}
            >
              <option value="">
                {loadingTechnicians
                  ? "Loading technicians..."
                  : technicians.length
                    ? "Select technician"
                    : "No eligible technicians"}
              </option>
              {technicians.map((tech) => (
                <option key={tech.id} value={String(tech.id)}>
                  {tech.fullName} ({tech.email})
                </option>
              ))}
            </select>
            <button
              className="btn"
              onClick={handleAssign}
              disabled={saving || !assignTo.trim() || loadingTechnicians}
            >
              {ticket.assignedTo ? "Reassign" : "Assign"}
            </button>
          </div>
          {ticket.assignedToName && (
            <p className="admin-panel-hint">
              Currently assigned to: <strong>{ticket.assignedToName}</strong>
            </p>
          )}
        </div>
      )}

      {/* Close */}
      {canClose && (
        <div className="admin-panel-section">
          <label className="admin-panel-label">Close Ticket</label>
          <p className="admin-panel-hint">Ticket is resolved. Close it to complete the workflow.</p>
          <button className="btn" onClick={handleClose} disabled={saving}>
            ✅ Close Ticket
          </button>
        </div>
      )}

      {/* Reject */}
      {!isRejectedOrClosed && (
        <div className="admin-panel-section">
          <label className="admin-panel-label">Reject Ticket</label>
          {!showRejectForm ? (
            <button
              className="btn danger"
              onClick={() => setShowRejectForm(true)}
              disabled={saving}
            >
              ✕ Reject Ticket
            </button>
          ) : (
            <div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection..."
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn danger"
                  onClick={handleReject}
                  disabled={
                    saving ||
                    !rejectReason.trim() ||
                    rejectReason.trim().length < 10 ||
                    rejectReason.trim().length > 4000
                  }
                >
                  Confirm Reject
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isRejectedOrClosed && (
        <p className="admin-panel-hint" style={{ fontStyle: "italic" }}>
          This ticket is {ticket.status.toLowerCase()} - no further admin actions available.
        </p>
      )}
    </div>
  );
}
