import { useEffect, useState } from "react";
import { getAllTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";

const TABS = [
  { label: "All", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

const PAGE_SIZE = 10;

export default function AdminTicketsPage() {
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
      const data = await getAllTickets(filters);
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Tickets</h1>
          <p className="page-subtitle">
            Manage, assign, reject and close tickets across the campus.
            {!loading && (
              <span className="ticket-count-badge">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="tab-bar tab-bar-scrollable">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-btn ${activeTab === tab.value ? "active" : ""}`}
            onClick={() => { setActiveTab(tab.value); setPage(0); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="error-box"><span>Error</span> {error}</div>}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          linkBase="/admin/tickets"
          emptyMessage="No tickets found for this filter."
        />
      )}

      {!loading && (tickets.length > 0 || page > 0) && (
        <div className="pagination">
          <button
            className="btn secondary"
            onClick={() => { const p = page - 1; setPage(p); load(activeTab, p); }}
            disabled={page === 0}
          >Previous</button>
          <span className="pagination-page">Page {page + 1}</span>
          <button
            className="btn secondary"
            onClick={() => { const p = page + 1; setPage(p); load(activeTab, p); }}
            disabled={!hasMore}
          >Next</button>
        </div>
      )}
    </div>
  );
}
