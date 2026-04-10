import { useEffect, useState } from "react";
import { getTechnicianTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";

const TABS = [
  { label: "All", value: "", overdue: false, dueSoon: false },
  { label: "Open", value: "OPEN", overdue: false, dueSoon: false },
  { label: "In Progress", value: "IN_PROGRESS", overdue: false, dueSoon: false },
  { label: "⚠️ Overdue", value: "", overdue: true, dueSoon: false },
  { label: "⏰ Due Soon", value: "", overdue: false, dueSoon: true },
];

const PAGE_SIZE = 10;

export default function TechnicianTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  async function load(tabIdx, pageNum) {
    setLoading(true);
    setError("");
    const tab = TABS[tabIdx];
    try {
      const filters = {
        page: pageNum,
        size: PAGE_SIZE,
        ...(tab.value ? { status: tab.value } : {}),
        ...(tab.overdue ? { overdue: true } : {}),
        ...(tab.dueSoon ? { dueSoon: true } : {}),
      };
      const data = await getTechnicianTickets(filters);
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

  function switchTab(idx) {
    setActiveTab(idx);
    setPage(0);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔧 Assigned Tickets</h1>
          <p className="page-subtitle">
            Tickets assigned to you. Update status and add resolution notes.
            {!loading && (
              <span className="ticket-count-badge">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="tab-bar">
        {TABS.map((tab, idx) => (
          <button
            key={idx}
            className={`tab-btn ${activeTab === idx ? "active" : ""}`}
            onClick={() => switchTab(idx)}
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
          linkBase="/technician/tickets"
          emptyMessage="No tickets assigned to you."
        />
      )}

      {!loading && (tickets.length > 0 || page > 0) && (
        <div className="pagination">
          <button className="btn secondary" onClick={() => { const p = page - 1; setPage(p); load(activeTab, p); }} disabled={page === 0}>
            ← Previous
          </button>
          <span className="pagination-page">Page {page + 1}</span>
          <button className="btn secondary" onClick={() => { const p = page + 1; setPage(p); load(activeTab, p); }} disabled={!hasMore}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
