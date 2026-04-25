import { useNavigate } from "react-router-dom";
import TicketForm from "../../components/ticket/TicketForm";
import { createTicket, uploadAttachments } from "../../api/ticket/ticketApi";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  async function handleCreate(data, files = []) {
    const ticket = await createTicket(data);
    if (files.length > 0) {
      await uploadAttachments(ticket.id, files);
    }
    navigate(`/tickets/${ticket.id}`);
  }

  const handleBack = () => {
    navigate("/tickets/my", { replace: false });
  };

  return (
    <div className="page">
      <div className="form-layout-wrapper">
        <button onClick={handleBack} className="btn-back btn-back-floating">
          ← Back
        </button>
        <TicketForm onSubmit={handleCreate} submitText="Create Ticket" />
      </div>
    </div>
  );
}
