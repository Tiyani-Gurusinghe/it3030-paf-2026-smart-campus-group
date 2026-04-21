import { useNavigate } from "react-router-dom";
import TicketForm from "../../components/ticket/TicketForm";
import { createTicket } from "../../api/ticket/ticketApi";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    const ticket = await createTicket(data);
    navigate(`/tickets/${ticket.id}`);
  }

  return (
    <div className="page">
      <TicketForm onSubmit={handleCreate} submitText="🎫 Create Ticket" />
    </div>
  );
}