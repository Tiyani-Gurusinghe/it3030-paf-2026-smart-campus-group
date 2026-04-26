import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteTicket, getMyTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";

const TABS = [
  { label: "All", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed / Rejected", value: "CLOSED_OR_REJECTED" },
];

const PAGE_SIZE = 10;
const FILTERED_FETCH_SIZE = 100;
const MAX_FILTERED_PAGES = 50;

function matchesTab(ticket, status) {
  if (!status) return true;
  if (status === "CLOSED_OR_REJECTED") {
    return ticket.status === "CLOSED" || ticket.status === "REJECTED";
  }
  return ticket.status === status;
}

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [blockedDeleteTicket, setBlockedDeleteTicket] = useState(null);

  async function load(status, pageNum) {
    setLoading(true);
    setError("");
    try {
      if (!status) {
        const data = await getMyTickets({ page: pageNum, size: PAGE_SIZE });
        const items = Array.isArray(data) ? data : data.content ?? [];
        const total = Array.isArray(data) ? null : data.totalPages;
        setTickets(items);
        setHasMore(total !== null ? pageNum + 1 < total : items.length === PAGE_SIZE);
        return;
      }

      let currentPage = 0;
      let collected = [];

      while (currentPage < MAX_FILTERED_PAGES) {
        const data = await getMyTickets({ page: currentPage, size: FILTERED_FETCH_SIZE });
        const pageItems = Array.isArray(data) ? data : data.content ?? [];
        collected = collected.concat(pageItems);

        const hasAnotherPage = Array.isArray(data)
          ? pageItems.length === FILTERED_FETCH_SIZE
          : currentPage + 1 < (data.totalPages ?? 0);

        if (!hasAnotherPage) break;
        currentPage += 1;
      }

      const filtered = collected.filter((ticket) => matchesTab(ticket, status));
      const start = pageNum * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setTickets(filtered.slice(start, end));
      setHasMore(end < filtered.length);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(0);
    load(activeTab, 0);
  }, [activeTab]);

  function handleTabChange(val) {
    setActiveTab(val);
  }

  function handlePrev() {
    const prev = page - 1;
    setPage(prev);
    load(activeTab, prev);
  }

  function handleNext() {
    const next = page + 1;
    setPage(next);
    load(activeTab, next);
  }

  async function handleDelete(id) {
    try {
      setError("");
      await deleteTicket(id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      setBlockedDeleteTicket(null);
    } catch (err) {
      setError(err.message || "Failed to delete ticket");
    }
  }

  function requestDelete(id) {
    const ticket = tickets.find((item) => item.id === id);
    if (ticket?.status !== "OPEN") {
      setBlockedDeleteTicket(ticket);
      return;
    }
    setBlockedDeleteTicket({ ...ticket, canDelete: true });
  }

  function closeTicketPopup() {
    setBlockedDeleteTicket(null);
  }

  function goToTicketActions() {
    if (!blockedDeleteTicket) return;
    navigate(`/tickets/${blockedDeleteTicket.id}`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-subtitle">
            Track all your submitted maintenance and incident reports.
            {!loading && (
              <span className="ticket-count-badge">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <Link to="/tickets/create" className="btn">+ Create Ticket</Link>
      </div>

      {/* Tab Filters */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-btn ${activeTab === tab.value ? "active" : ""}`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="error-box"><span>Error</span> {error}</div>}

      {blockedDeleteTicket && (
        <div className="ticket-modal-backdrop" role="presentation">
          <div className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="ticket-delete-title">
            {blockedDeleteTicket.canDelete ? (
              <>
                <h2 id="ticket-delete-title">Delete ticket permanently?</h2>
                <p>
                  Ticket #{blockedDeleteTicket.id} is still open. Deleting it removes the ticket from your list and from the system history.
                </p>
                <div className="ticket-modal-summary">
                  <strong>{blockedDeleteTicket.title}</strong>
                  <span>Status: {blockedDeleteTicket.status}</span>
                </div>
                <div className="ticket-modal-actions">
                  <button className="btn secondary" type="button" onClick={closeTicketPopup}>
                    Cancel
                  </button>
                  <button className="btn danger" type="button" onClick={() => handleDelete(blockedDeleteTicket.id)}>
                    Delete Ticket
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="ticket-delete-title">This ticket should be closed, not deleted</h2>
                <p>
                  Ticket #{blockedDeleteTicket.id} is already in <strong>{blockedDeleteTicket.status.replace("_", " ")}</strong> status, so it cannot be deleted by the reporter. This keeps the ticket history, comments, assignments, and SLA records available for review.
                </p>
                <p>
                  If the issue has been fixed, open the ticket and use the ticket actions to mark it as <strong>Resolved</strong>. After it is resolved, you can <strong>Close Ticket</strong> to finish the workflow.
                </p>
                <div className="ticket-modal-summary">
                  <strong>{blockedDeleteTicket.title}</strong>
                  <span>Use resolve and close instead of deleting this ticket.</span>
                </div>
                <div className="ticket-modal-actions">
                  <button className="btn secondary" type="button" onClick={closeTicketPopup}>
                    Got It
                  </button>
                  <button className="btn" type="button" onClick={goToTicketActions}>
                    Open Ticket Actions
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          linkBase="/tickets"
          onDelete={requestDelete}
          emptyMessage="You haven't submitted any tickets yet."
          emptyAction={<Link to="/tickets/create" className="btn">+ Create Your First Ticket</Link>}
        />
      )}

      {/* Pagination */}
      {!loading && (tickets.length > 0 || page > 0) && (
        <div className="pagination">
          <button className="btn secondary" onClick={handlePrev} disabled={page === 0}>
            Previous
          </button>
          <span className="pagination-page">Page {page + 1}</span>
          <button className="btn secondary" onClick={handleNext} disabled={!hasMore}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
