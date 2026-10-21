import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getTicketById,
    getAgents,
    assignTicket,
    getTicketActivity,
    getTicketComments,
    addTicketComment,
    updateTicketStatus
} from "../../services/ticketService";
import StatusStepper from "../../components/common/StatusStepper";
import { StatusBadge, PriorityBadge, CategoryBadge, RoleBadge } from "../../components/common/Badge";
import MarkdownContent from "../../components/common/MarkdownContent";
import ActivityTimeline from "../../components/tickets/ActivityTimeline";
import TicketQuickActions from "../../components/tickets/TicketQuickActions";
import {
    ArrowLeft,
    UserCheck,
    CheckCircle2,
    AlertCircle,
    Activity,
    MessageSquare,
    Send,
    Shield,
    Users,
    Clock,
    Lock,
    AlertTriangle
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import SlaBadge from "../../components/common/SlaBadge";
import { DetailSkeleton } from "../../components/common/Skeleton";

export default function AdminTicketDetails() {
    const { ticketId } = useParams();
    const { success: toastSuccess, error: toastError, confirm } = useToast();

    const [ticket, setTicket] = useState(null);
    const [agents, setAgents] = useState([]);
    const [activity, setActivity] = useState([]);
    const [comments, setComments] = useState([]);
    const [agentId, setAgentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [newComment, setNewComment] = useState("");
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [ticketData, agentData, activityData, commentsData] =
                await Promise.all([
                    getTicketById(ticketId),
                    getAgents(),
                    getTicketActivity(ticketId).catch(() => []),
                    getTicketComments(ticketId).catch(() => [])
                ]);

            setTicket(ticketData);
            setAgents(Array.isArray(agentData) ? agentData : []);
            setActivity(Array.isArray(activityData) ? activityData : []);
            setComments(Array.isArray(commentsData) ? commentsData : []);
            setAgentId("");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Unable to load ticket details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [ticketId]);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!agentId) {
            setError("Please select an agent to assign.");
            return;
        }

        if (ticket?.status !== "OPEN") {
            setError("Only OPEN tickets can be assigned.");
            return;
        }

        const selectedAgent = agents.find((a) => String(a.id) === String(agentId));
        const agentName = selectedAgent ? selectedAgent.name : "selected agent";

        const confirmed = await confirm({
            title: "Assign Support Agent",
            message: `Are you sure you want to assign ticket #${ticket.id} to ${agentName}?`,
            confirmText: "Assign Agent",
            type: "info"
        });

        if (!confirmed) return;

        try {
            setAssigning(true);
            setError("");
            setSuccess("");

            const updatedTicket = await assignTicket(ticketId, agentId);
            setTicket(updatedTicket);
            setAgentId("");
            toastSuccess(`Ticket assigned to ${agentName} successfully.`);
            setSuccess(`Ticket assigned to ${agentName} successfully.`);

            // Refresh activity
            const updatedActivity = await getTicketActivity(ticketId).catch(() => []);
            setActivity(Array.isArray(updatedActivity) ? updatedActivity : []);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Unable to assign ticket.";
            toastError(msg);
            setError(msg);
        } finally {
            setAssigning(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmittingComment(true);
            const finalContent = isInternalNote
                ? `🔒 [INTERNAL NOTE]\n${newComment.trim()}`
                : newComment.trim();

            await addTicketComment(ticketId, finalContent);
            setNewComment("");
            toastSuccess(isInternalNote ? "Internal administrative note logged." : "Reply posted to customer.");

            const [c, a] = await Promise.all([
                getTicketComments(ticketId),
                getTicketActivity(ticketId)
            ]);
            setComments(Array.isArray(c) ? c : []);
            setActivity(Array.isArray(a) ? a : []);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to post comment.";
            toastError(msg);
            setError(msg);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleStatusChange = async (nextStatus) => {
        if (!nextStatus || nextStatus === ticket?.status) return;

        const confirmed = await confirm({
            title: "Update Ticket Status",
            message: `Change ticket #${ticket.id} status from ${ticket.status} to ${nextStatus}?`,
            confirmText: "Update Status",
            type: "primary"
        });

        if (!confirmed) return;

        try {
            setError("");
            await updateTicketStatus(ticketId, nextStatus);
            toastSuccess(`Ticket status updated to ${nextStatus}.`);
            await loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to update ticket status.";
            toastError(msg);
            setError(msg);
        }
    };

    if (loading) {
        return <DetailSkeleton />;
    }

    if (!ticket) {
        return (
            <div className="tickets-page-view">
                <div className="dashboard-error-banner">
                    <AlertCircle size={20} />
                    <span>{error || "Ticket not found or access denied."}</span>
                </div>
                <Link to="/admin/tickets" className="btn btn-secondary btn-sm">
                    Back to All Tickets
                </Link>
            </div>
        );
    }

    const isOpen = ticket.status === "OPEN";
    const hasDispute = comments.some((c) => c.content?.includes("⚠️ [REOPEN / DISPUTE REQUEST]"));

    return (
        <div className="ticket-detail-view">
            {/* Header */}
            <div className="detail-header-row">
                <Link to="/admin/tickets" className="back-nav-link">
                    <ArrowLeft size={16} />
                    <span>Back to All Tickets</span>
                </Link>

                <div className="detail-header-content">
                    <div className="detail-title-line">
                        <span className="id-badge-large">#{ticket.id}</span>
                        <h1>{ticket.title}</h1>
                    </div>
                    <div className="detail-badge-group">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <CategoryBadge category={ticket.category} />
                        <SlaBadge ticket={ticket} />
                    </div>
                </div>

                <div className="detail-header-actions">
                    <TicketQuickActions onRefresh={loadData} isRefreshing={loading} />
                </div>
            </div>

            {/* Visual Status Stepper */}
            <div className="detail-card stepper-container-card">
                <StatusStepper currentStatus={ticket.status} />
            </div>

            {/* Admin Assignment Banner (if OPEN) */}
            {isOpen ? (
                <div className="action-highlight-banner notice-warning">
                    <div className="banner-text-group">
                        <Clock size={22} className="text-warning" />
                        <div>
                            <strong>Ticket Awaiting Agent Assignment</strong>
                            <p>Select a qualified support engineer from your agent pool to begin investigation.</p>
                        </div>
                    </div>

                    <form onSubmit={handleAssign} className="assign-form-inline">
                        <select
                            value={agentId}
                            onChange={(e) => setAgentId(e.target.value)}
                            className="form-control select-agent-input"
                            required
                        >
                            <option value="">Choose Support Agent...</option>
                            {agents.map((ag) => (
                                <option key={ag.id} value={ag.id}>
                                    {ag.name} ({ag.email})
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={assigning || !agentId}
                            className="btn btn-primary btn-md"
                        >
                            <UserCheck size={16} />
                            <span>{assigning ? "Assigning..." : "Assign Agent"}</span>
                        </button>
                    </form>
                </div>
            ) : (
                ticket.assignedToName && (
                    <div className="action-highlight-banner notice-assigned-info">
                        <div className="banner-text-group">
                            <UserCheck size={22} className="text-accent" />
                            <div>
                                <strong>Assigned to {ticket.assignedToName}</strong>
                                <p>This ticket is currently managed under the assigned agent's workspace.</p>
                            </div>
                        </div>
                    </div>
                )
            )}

            {success && (
                <div className="dashboard-success-banner">
                    <CheckCircle2 size={18} />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="dashboard-error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {hasDispute && (
                <div className="action-highlight-banner notice-warning">
                    <div className="banner-text-group">
                        <AlertTriangle size={22} className="text-warning" />
                        <div>
                            <strong>Customer Reopen / Dispute Request Active</strong>
                            <p>
                                The customer has submitted a formal dispute indicating this issue remains unresolved. Review notes in the discussion thread.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2-Column Grid */}
            <div className="ticket-detail-grid">
                {/* Main Column */}
                <div className="ticket-main-col">
                    <div className="detail-card">
                        <div className="detail-section-title">
                            <h3>Issue Description</h3>
                        </div>
                        <div className="ticket-description-body">
                            <MarkdownContent content={ticket.description} />
                        </div>
                    </div>

                    {/* Discussion Thread */}
                    <div className="detail-card comments-card">
                        <div className="detail-section-title">
                            <div className="title-with-count">
                                <MessageSquare size={18} />
                                <h3>Communication Thread ({comments.length})</h3>
                            </div>
                        </div>

                        <div className="comments-thread">
                            {comments.length === 0 ? (
                                <p className="text-muted empty-thread-text">
                                    No comments recorded for this ticket.
                                </p>
                            ) : (
                                comments.map((c) => {
                                    const isInternal = c.content?.startsWith("🔒 [INTERNAL NOTE]");
                                    const displayContent = isInternal
                                        ? c.content.replace(/^🔒 \[INTERNAL NOTE\]\n?/, "")
                                        : c.content;
                                    const authorName = c.createdByName || c.authorName || "User";
                                    const authorRole = c.createdByRole || c.authorRole;
                                    const authorInitials = authorName.substring(0, 2).toUpperCase();
                                    return (
                                        <div
                                            className={`comment-bubble ${isInternal ? "comment-bubble-internal" : ""}`}
                                            key={c.id}
                                        >
                                            <div className="comment-avatar">
                                                {authorInitials}
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <span className="comment-author">{authorName}</span>
                                                    {authorRole && <RoleBadge role={authorRole} />}
                                                    {isInternal && (
                                                        <span className="internal-badge">
                                                            <Lock size={11} /> Internal Note
                                                        </span>
                                                    )}
                                                    <span className="comment-time">
                                                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                                                    </span>
                                                </div>
                                                <div className="comment-text">
                                                    <MarkdownContent content={displayContent} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {ticket.status !== "CLOSED" && ticket.status !== "CANCELLED" && (
                            <form onSubmit={handleCommentSubmit} className="comment-composer">
                                <div className="composer-mode-tabs">
                                    <button
                                        type="button"
                                        className={`composer-tab-btn ${!isInternalNote ? "active" : ""}`}
                                        onClick={() => setIsInternalNote(false)}
                                    >
                                        <MessageSquare size={14} />
                                        <span>Public Reply (to Customer)</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`composer-tab-btn tab-internal ${isInternalNote ? "active" : ""}`}
                                        onClick={() => setIsInternalNote(true)}
                                    >
                                        <Lock size={14} />
                                        <span>Internal Staff Note (Private)</span>
                                    </button>
                                </div>

                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={
                                        isInternalNote
                                            ? "Write private administrative notes, internal triage info, or handover details... (Visible ONLY to agents and admins)"
                                            : "Add an administrative note or reply to customer..."
                                    }
                                    rows={3}
                                    className={`form-control ${isInternalNote ? "internal-note-textarea" : ""}`}
                                    required
                                />
                                <div className="composer-actions">
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !newComment.trim()}
                                        className="btn btn-primary btn-sm"
                                    >
                                        {submittingComment ? "Posting..." : (
                                            <>
                                                <Send size={14} />
                                                <span>{isInternalNote ? "Save Internal Note" : "Send Reply"}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="ticket-side-col">
                    <div className="detail-card properties-card">
                        <h3>Properties</h3>
                        <div className="properties-list">
                            <div className="property-row">
                                <span className="property-label">SLA Urgency</span>
                                <span className="property-value">
                                    <SlaBadge ticket={ticket} />
                                </span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Status</span>
                                <div className="property-status-changer">
                                    <StatusBadge status={ticket.status} />
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="status-inline-select"
                                        title="Change ticket status"
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="ASSIGNED">ASSIGNED</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Priority</span>
                                <span className="property-value">
                                    <PriorityBadge priority={ticket.priority} />
                                </span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Category</span>
                                <span className="property-value">
                                    <CategoryBadge category={ticket.category} />
                                </span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Requester</span>
                                <span className="property-value">{ticket.createdByName}</span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Assigned Agent</span>
                                <span className="property-value">
                                    {ticket.assignedToName || (
                                        <span className="badge-unassigned">Unassigned</span>
                                    )}
                                </span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Created Date</span>
                                <span className="property-value">
                                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
                                </span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Last Updated</span>
                                <span className="property-value">
                                    {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Activity Timeline */}
                    <ActivityTimeline activity={activity} />
                </div>
            </div>
        </div>
    );
}
