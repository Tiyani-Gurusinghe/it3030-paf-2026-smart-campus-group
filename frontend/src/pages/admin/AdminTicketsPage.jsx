import { useEffect, useState, useMemo } from "react";
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

const DATE_FILTER_OPTIONS = [
  { val: "", label: "Filter by Due Date (All Time)" },
  { val: "THIS_WEEK", label: "This Week" },
  { val: "NEXT_MONTH", label: "Next Month" },
  { val: "LAST_3_MONTHS", label: "Last 3 Months" },
  { val: "PAST_YEAR", label: "Past Year" }
];

export default function AdminTicketsPage() {
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Fetch all to enable frontend filtering
      const filters = { page: 0, size: 1000 };
      if (activeTab) filters.status = activeTab;
      
      const data = await getAllTickets(filters);
      const items = Array.isArray(data) ? data : data.content ?? [];
      setAllTickets(items);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(0);
    setAssignedToFilter("");
    setResourceFilter("");
    setDueDateFilter("");
    setFromDate("");
    setToDate("");
    load();
  }, [activeTab]);

  // Extract unique assignees for dropdown
  const assignees = useMemo(() => {
    const map = new Map();
    allTickets.forEach(t => {
      if (t.assignedTo) {
        map.set(t.assignedTo, t.assignedToName || `User #${t.assignedTo}`);
      } else {
        map.set("unassigned", "Unassigned");
      }
    });
    return Array.from(map.entries()).map(([val, label]) => ({ val: String(val), label }));
  }, [allTickets]);

  // Extract unique resources for dropdown
  const resources = useMemo(() => {
    const map = new Map();
    allTickets.forEach(t => {
      if (t.resourceId) {
        map.set(t.resourceId, t.resourceName || `Resource #${t.resourceId}`);
      }
    });
    return Array.from(map.entries()).map(([val, label]) => ({ val: String(val), label }));
  }, [allTickets]);

  // Apply frontend filters
  const filteredTickets = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const today = new Date(now);

    return allTickets.filter(t => {
      if (assignedToFilter) {
        if (assignedToFilter === "unassigned" && t.assignedTo != null) return false;
        if (assignedToFilter !== "unassigned" && String(t.assignedTo) !== assignedToFilter) return false;
      }
      
      if (resourceFilter && String(t.resourceId) !== resourceFilter) {
        return false;
      }
      
      if (t.dueAt) {
        const d = new Date(t.dueAt);
        
        if (dueDateFilter === "THIS_WEEK") {
          const day = now.getDay();
          const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
          const startOfWeek = new Date(new Date(now).setDate(diffToMonday));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23,59,59,999);
          if (d < startOfWeek || d > endOfWeek) return false;
        }
        else if (dueDateFilter === "NEXT_MONTH") {
          const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59, 999);
          if (d < startOfNextMonth || d > endOfNextMonth) return false;
        }
        else if (dueDateFilter === "LAST_3_MONTHS") {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          const endOfToday = new Date(today);
          endOfToday.setHours(23,59,59,999);
          if (d < threeMonthsAgo || d > endOfToday) return false;
        }
        else if (dueDateFilter === "PAST_YEAR") {
          const oneYearAgo = new Date(today);
          oneYearAgo.setFullYear(today.getFullYear() - 1);
          const endOfToday = new Date(today);
          endOfToday.setHours(23,59,59,999);
          if (d < oneYearAgo || d > endOfToday) return false;
        }
        
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0,0,0,0);
          if (d < from) return false;
        }
        
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23,59,59,999);
          if (d > to) return false;
        }
      } else if (dueDateFilter || fromDate || toDate) {
        return false;
      }
      return true;
    });
  }, [allTickets, assignedToFilter, resourceFilter, dueDateFilter, fromDate, toDate]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE);
  const currentTickets = filteredTickets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasMore = page + 1 < totalPages;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Tickets</h1>
          <p className="page-subtitle">
            Manage, assign, reject and close tickets across the campus.
            {!loading && (
              <span className="ticket-count-badge">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="tab-bar tab-bar-scrollable" style={{ marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-btn ${activeTab === tab.value ? "active" : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="filter-group" style={{ marginBottom: "24px" }}>
        <select 
          className="filter-select" 
          value={assignedToFilter}
          onChange={(e) => { setAssignedToFilter(e.target.value); setPage(0); }}
        >
          <option value="">Filter by Assigned To (All)</option>
          {assignees.map(a => <option key={a.val} value={a.val}>{a.label}</option>)}
        </select>
        
        <select 
          className="filter-select" 
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(0); }}
        >
          <option value="">Filter by Resource (All)</option>
          {resources.map(a => <option key={a.val} value={a.val}>{a.label}</option>)}
        </select>
        
        <select 
          className="filter-select" 
          value={dueDateFilter}
          onChange={(e) => { setDueDateFilter(e.target.value); setPage(0); }}
        >
          {DATE_FILTER_OPTIONS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '38px', transition: 'border-color 0.15s' }}>
          <span style={{ padding: '0 20px', fontSize: '13px', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', height: '100%', display: 'flex', alignItems: 'center' }}>Range</span>
          <input 
            type="date" 
            style={{ border: 'none', background: 'transparent', padding: '0 12px', fontSize: '13px', color: 'var(--text-secondary)', outline: 'none', height: '100%' }}
            value={fromDate}
            max={toDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
          />
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>→</span>
          <input 
            type="date" 
            style={{ border: 'none', background: 'transparent', padding: '0 12px', fontSize: '13px', color: 'var(--text-secondary)', outline: 'none', height: '100%' }}
            value={toDate}
            min={fromDate}
            onChange={(e) => { setToDate(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {error && <div className="error-box"><span>Error</span> {error}</div>}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <TicketList
          tickets={currentTickets}
          linkBase="/admin/tickets"
          emptyMessage="No tickets found for this filter."
        />
      )}

      {!loading && (filteredTickets.length > PAGE_SIZE) && (
        <div className="pagination">
          <button
            className="btn secondary"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
          >Previous</button>
          <span className="pagination-page">Page {page + 1} of {totalPages}</span>
          <button
            className="btn secondary"
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
          >Next</button>
        </div>
      )}
    </div>
  );
}
