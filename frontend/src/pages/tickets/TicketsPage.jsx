import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTicket, getTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";

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
    const confirmed = window.confirm("Delete this ticket?");
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
          <h1>Maintenance & Incident Tickets</h1>
          <p className="subtext">Create, track, update, and manage campus maintenance issues.</p>
        </div>
        <Link to="/tickets/new" className="btn">Create Ticket</Link>
      </div>

      {loading && <div className="card">Loading tickets...</div>}
      {error && <div className="error-box">{error}</div>}
      {!loading && !error && <TicketList tickets={tickets} onDelete={handleDelete} />}
    </div>
  );
}