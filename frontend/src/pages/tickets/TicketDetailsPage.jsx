import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicket, updateTicketStatus } from "../../api/ticket/ticketApi";
import StatusBadge from "../../components/ticket/StatusBadge";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err.message || "Failed to load ticket");
      }
    }

    loadTicket();
  }, [id]);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;

    try {
      setSaving(true);
      const updated = await updateTicketStatus(id, {
        status: newStatus,
        assignedTo: ticket.assignedTo || "",
        resolutionNotes: ticket.resolutionNotes || "",
      });
      setTicket(updated);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="card">Loading ticket...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card details-card">
        <div className="details-header">
          <div>
            <h1>{ticket.title}</h1>
            <p className="subtext">{ticket.location}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="details-grid">
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Preferred Contact:</strong> {ticket.preferredContact}</p>
          <p><strong>Assigned To:</strong> {ticket.assignedTo || "Not assigned"}</p>
        </div>

        <div className="details-section">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>

        <div className="details-section">
          <h3>Resolution Notes</h3>
          <p>{ticket.resolutionNotes || "No resolution notes yet."}</p>
        </div>

        <div className="details-section">
          <label htmlFor="status"><strong>Update Status</strong></label>
          <select id="status" value={ticket.status} onChange={handleStatusChange} disabled={saving}>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div className="card-actions">
          <Link to="/" className="btn secondary">Back</Link>
          <Link to={`/tickets/${ticket.id}/edit`} className="btn">Edit</Link>
        </div>
      </div>
    </div>
  );
}