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

  return (
    <div className="page">
      <TicketForm onSubmit={handleCreate} submitText="🎫 Create Ticket" />
    </div>
  );
}
