import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getTickets, getAgents, assignTicket } from "../../services/ticketService";
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
    Layers,
    UserCheck,
    LayoutGrid,
    List,
    Download
} from "lucide-react";

export default function AdminTickets() {
    const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();
    const [searchParams] = useSearchParams();
    const initialStatus = searchParams.get("status") || "";

    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(initialStatus);
    const [priority, setPriority] = useState("");
    const [category, setCategory] = useState("");
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("admin_tickets_view") || "table";
    });

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Quick Assign Modal State for DnD
    const [assignModalTicket, setAssignModalTicket] = useState(null);
    const [agents, setAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [assigning, setAssigning] = useState(false);

    const loadTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getTickets({
                search: search.trim() || undefined,
                status: status || undefined,
                priority: priority || undefined,
                category: category || undefined,
                page,
                size: 10,
                sort: "createdAt,desc"
            });

            setTickets(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Unable to load tickets."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [page, status, priority, category]);

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

    const loadAgents = async () => {
        if (agents.length > 0) return agents;
        try {
            const data = await getAgents();
            const list = Array.isArray(data) ? data : [];
            setAgents(list);
            return list;
        } catch (err) {
            console.error("Failed to load agents", err);
            return [];
        }
    };

    const handleStatusChange = async (ticketId, targetStatus, ticket) => {
        if (ticket.status === "OPEN" && targetStatus === "ASSIGNED") {
            // Prompt agent selection modal
            await loadAgents();
            setAssignModalTicket(ticket);
            setSelectedAgentId("");
            return;
        }

        if (ticket.status === "OPEN" && targetStatus !== "ASSIGNED") {
            toastWarning("New tickets must first be assigned to an agent before work can commence.");
            return;
        }

        if (targetStatus === "OPEN") {
            toastInfo("Ticket is already assigned. To reassign, open ticket details.");
            return;
        }

        toastInfo(
            `Ticket #${ticketId} is currently assigned to ${ticket.assignedToName || "an agent"}. Support agents manage transitions (In Progress ➔ Resolved).`
        );
    };

    const handleQuickAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assignModalTicket || !selectedAgentId) return;

        try {
            setAssigning(true);
            await assignTicket(assignModalTicket.id, selectedAgentId);
            const agentObj = agents.find((a) => a.id === Number(selectedAgentId));
            const agentName = agentObj?.name || "Agent";

            // Optimistic update in local state
            setTickets((prev) =>
                prev.map((t) =>
                    t.id === assignModalTicket.id
                        ? { ...t, status: "ASSIGNED", assignedToName: agentName }
                        : t
                )
            );

            toastSuccess(`Ticket #${assignModalTicket.id} assigned to ${agentName}.`);
            setAssignModalTicket(null);
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.message || "Failed to assign ticket.");
        } finally {
            setAssigning(false);
        }
    };

    const handleExportCSV = () => {
        if (!tickets || tickets.length === 0) {
            toastWarning("No tickets found to export.");
            return;
        }
        try {
            exportTicketsToCSV(
                tickets,
                `ServiceDesk_Admin_Tickets_${new Date().toISOString().slice(0, 10)}.csv`
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
                    <h1>All Support Tickets</h1>
                    <p>Global oversight of all organization requests, priorities, and assignments.</p>
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
                        title="Export current tickets to CSV"
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
                                localStorage.setItem("admin_tickets_view", "table");
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
                                localStorage.setItem("admin_tickets_view", "kanban");
                            }}
                            title="Kanban Board View"
                        >
                            <LayoutGrid size={15} />
                            <span>Board</span>
                        </button>
                    </div>

                    <Link to="/admin/dashboard" className="btn btn-secondary btn-md">
                        <Layers size={18} />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="filter-card">
                <QuickFilterPills
                    currentStatus={status}
                    currentPriority={priority}
                    role="ADMIN"
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
                            <option value="OPEN">Open (Unassigned)</option>
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

            {/* Table or Kanban View */}
            {loading ? (
                <div className="table-responsive-container">
                    <TableSkeleton rows={6} cols={9} />
                </div>
            ) : viewMode === "kanban" ? (
                <KanbanBoard
                    tickets={tickets}
                    basePath="/admin/tickets"
                    onStatusChange={handleStatusChange}
                />
            ) : (
                <div className="table-responsive-container">
                    {tickets.length === 0 ? (
                        <div className="empty-state-view">
                            <div className="empty-icon-wrap">
                                <TicketIcon size={32} />
                            </div>
                            <h3>No tickets found</h3>
                            <p>
                                {hasActiveFilters
                                    ? "No support tickets match the current filter criteria."
                                    : "No tickets exist in the system yet."}
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
                                    <th className="col-requester">Requester</th>
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
                                                to={`/admin/tickets/${t.id}`}
                                                className="ticket-table-title"
                                                title={t.title}
                                            >
                                                {t.title}
                                            </Link>
                                            <p className="ticket-table-desc-preview" title={t.description}>
                                                {t.description?.length > 60
                                                    ? t.description.substring(0, 60) + "..."
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
                                        <td className="cell-agent">
                                            {t.assignedToName ? (
                                                <span className="agent-pill-assigned">
                                                    <UserCheck size={12} />
                                                    <span>{t.assignedToName}</span>
                                                </span>
                                            ) : (
                                                <span className="badge-unassigned">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="cell-date">
                                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="cell-action">
                                            <Link
                                                to={`/admin/tickets/${t.id}`}
                                                className="btn btn-ghost btn-sm btn-icon-only"
                                                title="Manage Ticket"
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

            {/* Quick Assign Modal on Drop */}
            {assignModalTicket && (
                <div
                    className="modal-backdrop"
                    onClick={() => !assigning && setAssignModalTicket(null)}
                >
                    <div
                        className="confirm-modal-box"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="confirm-modal-header">
                            <div className="modal-icon-badge badge-primary">
                                <UserCheck size={22} />
                            </div>
                            <h3 className="modal-title">Assign Ticket #{assignModalTicket.id}</h3>
                        </div>

                        <form onSubmit={handleQuickAssignSubmit}>
                            <div className="confirm-modal-body">
                                <p style={{ marginBottom: "1rem" }}>
                                    Assign <strong>"{assignModalTicket.title}"</strong> to an available support engineer:
                                </p>
                                <select
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="form-control"
                                    required
                                    autoFocus
                                >
                                    <option value="">Choose Support Agent...</option>
                                    {agents.map((ag) => (
                                        <option key={ag.id} value={ag.id}>
                                            {ag.name} ({ag.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="confirm-modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={assigning}
                                    onClick={() => setAssignModalTicket(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={assigning || !selectedAgentId}
                                    className="btn btn-primary btn-sm"
                                >
                                    {assigning ? "Assigning..." : "Confirm Assignment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
