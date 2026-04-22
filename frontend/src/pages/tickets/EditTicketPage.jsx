import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TicketForm from "../../components/ticket/TicketForm";
import { getTicketById, updateTicket } from "../../api/ticket/ticketApi";

export default function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        console.error("Load Error:", err);
        setError("Could not find this ticket. It may have been deleted.");
      }
    }
    loadTicket();
  }, [id]);

  async function handleUpdate(formData) {
    setIsSubmitting(true);
    try {
      await updateTicket(id, formData);
      navigate(`/tickets/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update ticket");
      setIsSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-box">
          <span>⚠️</span> {error}
          <button onClick={() => navigate("/tickets/my")} className="btn secondary" style={{ marginLeft: 12 }}>
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          <div className="skeleton-card" style={{ height: 500, gridColumn: "1 / -1" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Edit Ticket #{id}</h2>
      </header>
      <TicketForm
        initialData={ticket}
        onSubmit={handleUpdate}
        submitText={isSubmitting ? "Saving..." : "Update Ticket"}
      />
    </div>
  );
}