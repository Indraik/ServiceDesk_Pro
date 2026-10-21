import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets, updateTicketStatus } from "../../services/ticketService";
import { useToast } from "../../context/ToastContext";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../../components/common/Badge";
import SlaBadge from "../../components/common/SlaBadge";
import KanbanBoard from "../../components/tickets/KanbanBoard";
import { TableSkeleton } from "../../components/common/Skeleton";
import QuickFilterPills from "../../components/common/QuickFilterPills";
import LiveRefreshControl from "../../components/common/LiveRefreshControl";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { exportTicketsToCSV } from "../../utils/csvExport";
import {
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Ticket as TicketIcon,
    AlertCircle,
    RotateCcw,
    Zap,
    LayoutGrid,
    List,
    Download
} from "lucide-react";

export default function AgentTickets() {
    const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("agent_tickets_view") || "table";
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
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
                "Unable to load assigned tickets."
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

    const handleStatusChange = async (ticketId, targetStatus, ticket) => {
        // Enforce valid transitions for agents
        if (ticket.status === "ASSIGNED" && targetStatus === "IN_PROGRESS") {
            // Valid transition
        } else if (ticket.status === "IN_PROGRESS" && targetStatus === "RESOLVED") {
            // Valid transition
        } else if (targetStatus === "CLOSED") {
            toastWarning("Customer verification is required to confirm and close tickets.");
            return;
        } else if (ticket.status === "ASSIGNED" && targetStatus === "RESOLVED") {
            toastWarning("Please move ticket to In Progress before marking it as Resolved.");
            return;
        } else {
            toastWarning(`Cannot move from ${ticket.status} to ${targetStatus}. Expected flow: Assigned ➔ In Progress ➔ Resolved.`);
            return;
        }

        // Optimistic UI update
        const originalTickets = [...tickets];
        setTickets((prev) =>
            prev.map((t) => (t.id === ticketId ? { ...t, status: targetStatus } : t))
        );

        try {
            await updateTicketStatus(ticketId, targetStatus);
            const statusLabel = targetStatus === "IN_PROGRESS" ? "In Progress" : "Resolved";
            toastSuccess(`Ticket #${ticketId} transitioned to ${statusLabel}.`);
        } catch (err) {
            console.error(err);
            setTickets(originalTickets);
            toastError(
                err.response?.data?.message ||
                `Failed to update ticket status to ${targetStatus}.`
            );
        }
    };

    const handleExportCSV = () => {
        if (!tickets || tickets.length === 0) {
            toastWarning("No assigned tickets found to export.");
            return;
        }
        try {
            exportTicketsToCSV(
                tickets,
                `ServiceDesk_Agent_Queue_${new Date().toISOString().slice(0, 10)}.csv`
            );
            toastSuccess(`Exported ${tickets.length} tickets to CSV.`);
        } catch (err) {
            toastError(err.message || "Export failed.");
        }
    };

    const {
        enabled: autoRefreshEnabled,
        toggleEnabled: toggleAutoRefresh,
        isRefreshing,
        lastRefreshed,
        triggerRefresh
    } = useAutoRefresh(loadTickets, 30000, false);

    const hasActiveFilters = Boolean(search || status || priority || category);

    return (
        <div className="tickets-page-view">
            {/* Header */}
            <div className="tickets-view-header">
                <div>
                    <h1>Assigned Ticket Queue</h1>
                    <p>Tickets assigned to you for investigation, troubleshooting, and resolution.</p>
                </div>

                <div className="header-actions-group">
                    <LiveRefreshControl
                        isRefreshing={isRefreshing}
                        lastRefreshed={lastRefreshed}
                        autoRefreshEnabled={autoRefreshEnabled}
                        onToggleAutoRefresh={toggleAutoRefresh}
                        onManualRefresh={triggerRefresh}
                    />

                    <button
                        type="button"
                        className="btn btn-secondary btn-md"
                        onClick={handleExportCSV}
                        title="Export assigned tickets to CSV"
                    >
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>

                    <div className="view-mode-toggle">
                        <button
                            type="button"
                            className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
                            onClick={() => {
                                setViewMode("table");
                                localStorage.setItem("agent_tickets_view", "table");
                            }}
                            title="Table View"
                        >
                            <List size={15} />
                            <span>Table</span>
                        </button>
                        <button
                            type="button"
                            className={`view-mode-btn ${viewMode === "kanban" ? "active" : ""}`}
                            onClick={() => {
                                setViewMode("kanban");
                                localStorage.setItem("agent_tickets_view", "kanban");
                            }}
                            title="Kanban Board View"
                        >
                            <LayoutGrid size={15} />
                            <span>Board</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="filter-card">
                <QuickFilterPills
                    currentStatus={status}
                    currentPriority={priority}
                    role="AGENT"
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
                            placeholder="Search assigned tickets..."
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
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
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

            {/* Table or Kanban View */}
            {loading ? (
                <div className="table-responsive-container">
                    <TableSkeleton rows={6} cols={8} />
                </div>
            ) : viewMode === "kanban" ? (
                <KanbanBoard
                    tickets={tickets}
                    basePath="/agent/tickets"
                    onStatusChange={handleStatusChange}
                />
            ) : (
                <div className="table-responsive-container">
                    {tickets.length === 0 ? (
                        <div className="empty-state-view">
                            <div className="empty-icon-wrap">
                                <Zap size={32} />
                            </div>
                            <h3>Queue is clear</h3>
                            <p>
                                {hasActiveFilters
                                    ? "No tickets match your filter criteria."
                                    : "You currently have no tickets assigned to your queue."}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Clear Filters
                                </button>
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
                                    <th className="col-sla">SLA Urgency</th>
                                    <th className="col-requester">Customer</th>
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
                                                to={`/agent/tickets/${t.id}`}
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
                                        <td className="cell-sla">
                                            <SlaBadge ticket={t} />
                                        </td>
                                        <td className="cell-requester">
                                            <span className="agent-name">
                                                {t.createdByName || "Customer"}
                                            </span>
                                        </td>
                                        <td className="cell-date">
                                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="cell-action">
                                            <Link
                                                to={`/agent/tickets/${t.id}`}
                                                className="btn btn-ghost btn-sm btn-icon-only"
                                                title="Open Ticket"
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
            )}

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
