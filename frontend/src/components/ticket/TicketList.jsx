import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function TicketList({ tickets, onDelete }) {
  if (!tickets.length) {
    return <div className="card">No tickets found.</div>;
  }

  return (
    <div className="ticket-grid">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="card ticket-card">
          <div className="ticket-card-top">
            <h3>{ticket.title}</h3>
            <StatusBadge status={ticket.status} />
          </div>

          <p><strong>Location:</strong> {ticket.location}</p>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Assigned To:</strong> {ticket.assignedTo || "Not assigned"}</p>

          <div className="card-actions">
            <Link to={`/tickets/${ticket.id}`} className="btn secondary">View</Link>
            <Link to={`/tickets/${ticket.id}/edit`} className="btn">Edit</Link>
            <button className="btn danger" onClick={() => onDelete(ticket.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}