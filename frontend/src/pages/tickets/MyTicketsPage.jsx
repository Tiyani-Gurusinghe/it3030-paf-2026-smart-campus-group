import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";

const TABS = [
  { label: "All", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed / Rejected", value: "CLOSED" },
];

const PAGE_SIZE = 10;

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
      const filters = { page: pageNum, size: PAGE_SIZE };
      if (status) filters.status = status;
      const data = await getMyTickets(filters);
      // Backend may return array or paginated { content, totalPages }
      const items = Array.isArray(data) ? data : data.content ?? [];
      const total = Array.isArray(data) ? null : data.totalPages;
      setTickets(items);
      setHasMore(total !== null ? pageNum + 1 < total : items.length === PAGE_SIZE);
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
