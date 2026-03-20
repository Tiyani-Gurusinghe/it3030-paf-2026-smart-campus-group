import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TicketForm from "../../components/ticket/TicketForm";
import { getTicket, updateTicket } from "../../api/ticket/ticketApi";

export default function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

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

  async function handleUpdate(data) {
    await updateTicket(id, data);
    navigate(`/tickets/${id}`);
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
      <TicketForm initialData={ticket} onSubmit={handleUpdate} submitText="Update Ticket" />
    </div>
  );
}