import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTicket, getTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";

function SkeletonCards() {
  return (
    <div className="skeleton-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTickets() {
    try {
      setError("");
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmed) return;

    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete ticket");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎫 Tickets</h1>
          <p className="page-subtitle">
            Create, track, and manage campus maintenance & incident reports.
          </p>
        </div>
        <Link to="/tickets/new" className="btn">
          + New Ticket
        </Link>
      </div>

      {error && (
        <div className="error-box">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading && <SkeletonCards />}

      {!loading && !error && (
        <TicketList tickets={tickets} onDelete={handleDelete} />
      )}
    </div>
  );
}