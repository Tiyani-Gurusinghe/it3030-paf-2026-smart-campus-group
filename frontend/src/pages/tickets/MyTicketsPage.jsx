import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTickets } from "../../api/ticket/ticketApi";
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎫 My Tickets</h1>
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

      {error && <div className="error-box"><span>⚠️</span> {error}</div>}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          linkBase="/tickets"
          emptyMessage="You haven't submitted any tickets yet."
          emptyAction={<Link to="/tickets/create" className="btn">+ Create Your First Ticket</Link>}
        />
      )}

      {/* Pagination */}
      {!loading && (tickets.length > 0 || page > 0) && (
        <div className="pagination">
          <button className="btn secondary" onClick={handlePrev} disabled={page === 0}>
            ← Previous
          </button>
          <span className="pagination-page">Page {page + 1}</span>
          <button className="btn secondary" onClick={handleNext} disabled={!hasMore}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
