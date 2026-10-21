import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getTickets } from "../../services/ticketService";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../../components/common/Badge";
import QuickFilterPills from "../../components/common/QuickFilterPills";
import {
    PlusCircle,
    Search,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Ticket as TicketIcon,
    AlertCircle,
    RotateCcw
} from "lucide-react";

export default function MyTickets() {
    const [searchParams] = useSearchParams();
    const initialStatus = searchParams.get("status") || "";

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(initialStatus);
    const [priority, setPriority] = useState("");
    const [category, setCategory] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const loadTickets = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getTickets({
                search: search.trim() || undefined,
                status: status || undefined,
                priority: priority || undefined,
                category: category || undefined,
                page,
                size: 10,
                sort: "createdAt,desc"
            });

            setTickets(data.content ?? []);
            setTotalPages(data.totalPages ?? 0);
            setTotalElements(data.totalElements ?? 0);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Unable to load tickets."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, priority, category, page]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        loadTickets();
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setPriority("");
        setCategory("");
        setPage(0);
    };

    const hasActiveFilters = Boolean(search || status || priority || category);

    return (
        <div className="tickets-page-view">
            {/* Header */}
            <div className="tickets-view-header">
                <div>
                    <h1>My Support Tickets</h1>
                    <p>Track issues you've reported and verify resolutions.</p>
                </div>
                <Link to="/customer/tickets/new" className="btn btn-primary btn-md">
                    <PlusCircle size={18} />
                    <span>Create Ticket</span>
                </Link>
            </div>

            {/* Filter / Search Bar */}
            <div className="filter-card">
                <QuickFilterPills
                    currentStatus={status}
                    currentPriority={priority}
                    role="CUSTOMER"
                    onFilterChange={({ status: newStatus, priority: newPriority }) => {
                        if (newStatus !== undefined) setStatus(newStatus);
                        if (newPriority !== undefined) setPriority(newPriority);
                        setPage(0);
                    }}
                />

                <form onSubmit={handleSearchSubmit} className="search-form-row">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input-field"
                        />
                        {search && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearch("")}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="dropdown-filters-group">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(0);
                            }}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        <select
                            value={priority}
                            onChange={(e) => {
                                setPriority(e.target.value);
                                setPage(0);
                            }}
                            className="filter-select"
                        >
                            <option value="">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>

                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(0);
                            }}
                            className="filter-select"
                        >
                            <option value="">All Categories</option>
                            <option value="SOFTWARE">Software</option>
                            <option value="HARDWARE">Hardware</option>
                            <option value="NETWORK">Network</option>
                            <option value="ACCESS_REQUEST">Access Request</option>
                            <option value="OTHER">Other</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="btn btn-ghost btn-sm btn-clear-filter"
                                title="Reset all filters"
                            >
                                <RotateCcw size={14} />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {error && (
                <div className="dashboard-error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Table Container */}
            <div className="table-responsive-container">
                {loading ? (
                    <div className="table-loading-state">
                        <div className="spinner"></div>
                        <p>Loading tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="empty-state-view">
                        <div className="empty-icon-wrap">
                            <TicketIcon size={32} />
                        </div>
                        <h3>No tickets found</h3>
                        <p>
                            {hasActiveFilters
                                ? "No support tickets match the current filters. Try resetting your search."
                                : "You haven't submitted any support requests yet."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="btn btn-secondary btn-sm"
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <Link to="/customer/tickets/new" className="btn btn-primary btn-sm">
                                <PlusCircle size={16} />
                                <span>Create Your First Ticket</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    <table className="modern-data-table">
                        <thead>
                            <tr>
                                <th className="col-id">Ticket ID</th>
                                <th className="col-title">Subject</th>
                                <th className="col-status">Status</th>
                                <th className="col-priority">Priority</th>
                                <th className="col-category">Category</th>
                                <th className="col-agent">Assigned Agent</th>
                                <th className="col-date">Created</th>
                                <th className="col-action">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((t) => (
                                <tr key={t.id} className="data-row">
                                    <td className="cell-id">
                                        <span className="id-badge">#{t.id}</span>
                                    </td>
                                    <td className="cell-title">
                                        <Link
                                            to={`/customer/tickets/${t.id}`}
                                            className="ticket-table-title"
                                            title={t.title}
                                        >
                                            {t.title}
                                        </Link>
                                        <p className="ticket-table-desc-preview" title={t.description}>
                                            {t.description?.length > 70
                                                ? t.description.substring(0, 70) + "..."
                                                : t.description}
                                        </p>
                                    </td>
                                    <td className="cell-status">
                                        <StatusBadge status={t.status} />
                                    </td>
                                    <td className="cell-priority">
                                        <PriorityBadge priority={t.priority} />
                                    </td>
                                    <td className="cell-category">
                                        <CategoryBadge category={t.category} />
                                    </td>
                                    <td className="cell-agent">
                                        <span className="agent-name">
                                            {t.assignedToName || <span className="text-muted">Unassigned</span>}
                                        </span>
                                    </td>
                                    <td className="cell-date">
                                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="cell-action">
                                        <Link
                                            to={`/customer/tickets/${t.id}`}
                                            className="btn btn-ghost btn-sm btn-icon-only"
                                            title="View Details"
                                        >
                                            <ArrowRight size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-bar">
                    <span className="pagination-info">
                        Showing page {page + 1} of {totalPages} ({totalElements} tickets)
                    </span>
                    <div className="pagination-actions">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={page === 0}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                            <ChevronLeft size={16} />
                            <span>Previous</span>
                        </button>
                        <span className="page-pill">{page + 1}</span>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <span>Next</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
