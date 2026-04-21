import TicketCard from "./TicketCard";

export default function TicketList({ tickets = [], linkBase = "/tickets", emptyMessage = "No tickets found." }) {
  if (!tickets.length) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">🎫</div>
        <h3>{emptyMessage}</h3>
        <p>Nothing to show here yet.</p>
      </div>
    );
  }

  return (
    <div className="ticket-grid">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} linkBase={linkBase} />
      ))}
    </div>
  );
}