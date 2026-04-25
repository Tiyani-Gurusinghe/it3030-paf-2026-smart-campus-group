import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTicket, getTickets } from "../../api/ticket/ticketApi";
import TicketList from "../../components/ticket/TicketList";
import useAuth from "../../features/auth/hooks/useAuth";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

function SkeletonCards() {
  return (
    <div className="skeleton-grid">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
    </div>
  );
}

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myTickets, setMyTickets] = useState(false);
  const [filters, setFilters] = useState({ status: "", priority: "" });

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setError("");
        const activeFilters = {
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(myTickets && user?.id ? { reportedBy: user.id } : {}),
        };
        const data = await getTickets(activeFilters);
        setTickets(data);
      } catch (err) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [filters, myTickets, user?.id]);

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmed) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete ticket");
    }
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({ status: "", priority: "" });
    setMyTickets(false);
  }

  const hasActiveFilters = filters.status || filters.priority || myTickets;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎫 Tickets</h1>
          <p className="page-subtitle">
            Create, track, and manage campus maintenance & incident reports.
            {!loading && (
              <span className="ticket-count-badge">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <Link to="/tickets/new" className="btn">+ New Ticket</Link>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>

          <select
            className="filter-select"
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

        </div>

        <div className="filter-actions">
          <button
            className={`btn secondary filter-toggle ${myTickets ? "active" : ""}`}
            onClick={() => setMyTickets((v) => !v)}
          >
            👤 My Tickets
          </button>
          {hasActiveFilters && (
            <button className="btn secondary" onClick={clearFilters}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box"><span>⚠️</span> {error}</div>}
      {loading && <SkeletonCards />}
      {!loading && !error && (
        <TicketList
          tickets={tickets}
          onDelete={handleDelete}
          emptyAction={<Link to="/tickets/new" className="btn">+ Create Ticket</Link>}
        />
      )}
    </div>
  );
}
