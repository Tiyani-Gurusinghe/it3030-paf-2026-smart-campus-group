import { useEffect, useState, useMemo } from "react";
import { deleteTicket, getAllTickets } from "../../api/ticket/ticketApi";
import resourceApi from "../../features/resources/api/resourceApi";
import TicketList from "../../components/ticket/TicketList";
import "./AdminTicketsPage.css";

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
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);

  const [allResources, setAllResources] = useState([]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Fetch all to enable frontend filtering
      const filters = { page: 0, size: 1000 };
      if (activeTab) filters.status = activeTab;
      
      const [data, resData] = await Promise.all([
        getAllTickets(filters),
        resourceApi.getAllResources()
      ]);
      const items = Array.isArray(data) ? data : data.content ?? [];
      setAllTickets(items);
      setAllResources(resData);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(0);
    setAssignedToFilter("");
    setFilterCategory("");
    setFilterSub("");
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

  const buildings = useMemo(() => allResources.filter(r => r.category === "BUILDING"), [allResources]);
  const assetTypes = useMemo(() => {
    const types = new Set();
    allResources.forEach(r => {
      if (r.category === "EQUIPMENT" || r.category === "UTILITY") {
        if (r.type) types.add(r.type);
      }
    });
    return Array.from(types).sort();
  }, [allResources]);

  const filteredResources = useMemo(() => {
    let list = allResources;
    if (filterCategory === "INFRA") {
      list = list.filter(r => r.category === "BUILDING" || r.category === "SPACE");
      if (filterSub) {
        list = list.filter(r => String(r.id) === filterSub || (r.parentResource && String(r.parentResource.id) === filterSub));
      }
    } else if (filterCategory === "INV") {
      list = list.filter(r => r.category === "EQUIPMENT" || r.category === "UTILITY");
      if (filterSub) {
        list = list.filter(r => r.type === filterSub);
      }
    }
    return list;
  }, [allResources, filterCategory, filterSub]);

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
      } else if (filterCategory || filterSub) {
         const allowedResourceIds = new Set(filteredResources.map(r => String(r.id)));
         if (!allowedResourceIds.has(String(t.resourceId))) return false;
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
  }, [allTickets, assignedToFilter, resourceFilter, filterCategory, filterSub, filteredResources, dueDateFilter, fromDate, toDate]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE);
  const currentTickets = filteredTickets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasMore = page + 1 < totalPages;

  async function handleDelete(id) {
    const shouldDelete = window.confirm(`Delete ticket #${id} permanently?`);
    if (!shouldDelete) return;

    try {
      setError("");
      await deleteTicket(id);
      setAllTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete ticket");
    }
  }

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
      <div className="admin-tab-bar admin-tab-bar-scrollable" style={{ marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`admin-tab-btn ${activeTab === tab.value ? "active" : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="admin-filter-container">
        <div className="admin-filter-group">
          <select 
            className="admin-filter-select" 
            value={assignedToFilter}
            onChange={(e) => { setAssignedToFilter(e.target.value); setPage(0); }}
          >
            <option value="">Filter by Assigned To (All)</option>
            {assignees.map(a => <option key={a.val} value={a.val}>{a.label}</option>)}
          </select>
          
          <select 
            className="admin-filter-select" 
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setFilterSub(""); setResourceFilter(""); setPage(0); }}
          >
            <option value="">Filter by Resource Category (All)</option>
            <option value="INFRA">Infrastructure (Buildings/Spaces)</option>
            <option value="INV">Inventory (Assets)</option>
          </select>

          {filterCategory === "INFRA" && (
            <select 
              className="admin-filter-select" 
              value={filterSub}
              onChange={(e) => { setFilterSub(e.target.value); setResourceFilter(""); setPage(0); }}
            >
              <option value="">All Buildings</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}

          {filterCategory === "INV" && (
            <select 
              className="admin-filter-select" 
              value={filterSub}
              onChange={(e) => { setFilterSub(e.target.value); setResourceFilter(""); setPage(0); }}
            >
              <option value="">All Asset Types</option>
              {assetTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          )}
          
          <select 
            className="admin-filter-select" 
            value={resourceFilter}
            onChange={(e) => { 
              const value = e.target.value;
              if (value) {
                const r = allResources.find(x => String(x.id) === value);
                if (r) {
                  if (r.category === "BUILDING" || r.category === "SPACE") {
                    setFilterCategory("INFRA");
                    if (r.category === "BUILDING") setFilterSub(String(r.id));
                    else if (r.parentResource) setFilterSub(String(r.parentResource.id));
                    else setFilterSub("");
                  } else if (r.category === "EQUIPMENT" || r.category === "UTILITY") {
                    setFilterCategory("INV");
                    setFilterSub(r.type || "");
                  }
                }
              }
              setResourceFilter(value); 
              setPage(0); 
            }}
          >
            <option value="">Specific Resource (All)</option>
            {filteredResources.map(a => <option key={a.id} value={a.id}>{a.name} {a.location ? `(${a.location})` : ""}</option>)}
          </select>

          <select 
            className="admin-filter-select" 
            value={dueDateFilter}
            onChange={(e) => { setDueDateFilter(e.target.value); setPage(0); }}
          >
            {DATE_FILTER_OPTIONS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
          </select>
        </div>

        <div className="admin-date-filter-row">
          <div className="admin-date-range-wrapper">
            <span className="admin-date-range-label">Range</span>
            <input 
              type="date" 
              className="admin-date-range-input"
              value={fromDate}
              max={toDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            />
            <span className="admin-date-range-separator">→</span>
            <input 
              type="date" 
              className="admin-date-range-input"
              value={toDate}
              min={fromDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            />
          </div>

          {(assignedToFilter || filterCategory || filterSub || resourceFilter || dueDateFilter || fromDate || toDate) ? (
            <button 
              className="btn secondary admin-clear-filters-btn"
              onClick={() => {
                setAssignedToFilter("");
                setFilterCategory("");
                setFilterSub("");
                setResourceFilter("");
                setDueDateFilter("");
                setFromDate("");
                setToDate("");
                setPage(0);
              }}
            >
              Clear Filters
            </button>
          ) : null}
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
          onDelete={handleDelete}
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
