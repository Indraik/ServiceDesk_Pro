import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getTicketById,
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
    PlayCircle,
    CheckCircle2,
    Send,
    MessageSquare,
    Activity,
    AlertCircle,
    AlertTriangle,
    ShieldCheck,
    Zap,
    Clock,
    Lock
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import SlaBadge from "../../components/common/SlaBadge";
import { DetailSkeleton } from "../../components/common/Skeleton";

export default function AgentTicketDetails() {
    const { ticketId } = useParams();
    const { user } = useAuth();
    const { success: toastSuccess, error: toastError, confirm } = useToast();

    const [ticket, setTicket] = useState(null);
    const [activity, setActivity] = useState([]);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const loadTicketData = async () => {
        try {
            setError("");
            const [ticketData, activityData, commentsData] =
                await Promise.all([
                    getTicketById(ticketId),
                    getTicketActivity(ticketId),
                    getTicketComments(ticketId)
                ]);

            setTicket(ticketData);
            setActivity(Array.isArray(activityData) ? activityData : []);
            setComments(Array.isArray(commentsData) ? commentsData : []);
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
        loadTicketData();
    }, [ticketId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setSubmitting(true);
            setError("");
            const finalContent = isInternalNote
                ? `🔒 [INTERNAL NOTE]\n${comment.trim()}`
                : comment.trim();

            await addTicketComment(ticketId, finalContent);
            setComment("");
            toastSuccess(isInternalNote ? "Internal note added." : "Reply posted to customer.");
            await loadTicketData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Unable to post comment.";
            toastError(msg);
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (nextStatus) => {
        const actionLabel = nextStatus === "IN_PROGRESS"
            ? "Start Investigation"
            : nextStatus === "RESOLVED"
            ? "Resolve Ticket"
            : nextStatus;

        const confirmed = await confirm({
            title: `${actionLabel}?`,
            message: nextStatus === "RESOLVED"
                ? "Are you sure you want to mark this ticket as RESOLVED? This will notify the customer."
                : `Are you sure you want to transition this ticket to ${nextStatus.replace('_', ' ')}?`,
            confirmText: actionLabel,
            type: nextStatus === "RESOLVED" ? "primary" : "info"
        });

        if (!confirmed) return;

        try {
            setStatusUpdating(true);
            setError("");
            await updateTicketStatus(ticketId, nextStatus);
            toastSuccess(`Ticket status updated to ${nextStatus.replace('_', ' ')} successfully.`);
            await loadTicketData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to update ticket status.";
            toastError(msg);
            setError(msg);
        } finally {
            setStatusUpdating(false);
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
                <Link to="/agent/tickets" className="btn btn-secondary btn-sm">
                    Back to Assigned Tickets
                </Link>
            </div>
        );
    }

    const canStart = ticket.status === "ASSIGNED";
    const canResolve = ticket.status === "IN_PROGRESS";
    const hasDispute = comments.some((c) => c.content?.includes("⚠️ [REOPEN / DISPUTE REQUEST]"));

    return (
        <div className="ticket-detail-view">
            {/* Header */}
            <div className="detail-header-row">
                <Link to="/agent/tickets" className="back-nav-link">
                    <ArrowLeft size={16} />
                    <span>Back to Assigned Queue</span>
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
                    <TicketQuickActions onRefresh={loadTicketData} isRefreshing={loading} />
                </div>
            </div>

            {/* Visual Status Stepper */}
            <div className="detail-card stepper-container-card">
                <StatusStepper currentStatus={ticket.status} />
            </div>

            {/* Agent Status Action Bar */}
            {(canStart || canResolve) && (
                <div className="action-highlight-banner notice-accent">
                    <div className="banner-text-group">
                        <Zap size={22} className="text-accent" />
                        <div>
                            <strong>Agent Workflow Action Required</strong>
                            <p>
                                {canStart
                                    ? "This ticket is assigned to you. Transition to 'In Progress' when you begin work."
                                    : "Investigating complete? Mark this ticket 'Resolved' to notify the customer for closure."}
                            </p>
                        </div>
                    </div>
                    <div className="action-button-group">
                        {canStart && (
                            <button
                                type="button"
                                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                                disabled={statusUpdating}
                                className="btn btn-primary btn-md"
                            >
                                <PlayCircle size={16} />
                                <span>{statusUpdating ? "Updating..." : "Start Investigation (In Progress)"}</span>
                            </button>
                        )}
                        {canResolve && (
                            <button
                                type="button"
                                onClick={() => handleStatusUpdate("RESOLVED")}
                                disabled={statusUpdating}
                                className="btn btn-success-solid btn-md"
                            >
                                <CheckCircle2 size={16} />
                                <span>{statusUpdating ? "Resolving..." : "Mark as Resolved"}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {successMsg && (
                <div className="dashboard-success-banner">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
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
                                The customer has indicated that the issue is still occurring. Please review their feedback in the conversation thread and post an update.
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

                    {/* Comments & Troubleshooting Log */}
                    <div className="detail-card comments-card">
                        <div className="detail-section-title">
                            <div className="title-with-count">
                                <MessageSquare size={18} />
                                <h3>Communication & Notes ({comments.length})</h3>
                            </div>
                        </div>

                        <div className="comments-thread">
                            {comments.length === 0 ? (
                                <p className="text-muted empty-thread-text">
                                    No notes or comments yet. Post an update for the customer below.
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

                        {/* Comment Composer with Mode Switcher */}
                        {ticket.status !== "CLOSED" && ticket.status !== "CANCELLED" ? (
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
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={
                                        isInternalNote
                                            ? "Write private technical notes, logs, or debugging info... (Visible ONLY to agents and admins)"
                                            : "Type response to customer..."
                                    }
                                    rows={3}
                                    className={`form-control ${isInternalNote ? "internal-note-textarea" : ""}`}
                                    required
                                />

                                <div className="composer-actions">
                                    <button
                                        type="submit"
                                        disabled={submitting || !comment.trim()}
                                        className={`btn btn-sm ${isInternalNote ? "btn-warning-solid" : "btn-primary"}`}
                                    >
                                        {submitting ? "Posting..." : (
                                            <>
                                                {isInternalNote ? <Lock size={14} /> : <Send size={14} />}
                                                <span>{isInternalNote ? "Post Internal Note" : "Send Reply"}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="closed-ticket-notice">
                                <ShieldCheck size={16} />
                                <span>This ticket is closed. Further notes are locked.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="ticket-side-col">
                    <div className="detail-card properties-card">
                        <h3>Properties</h3>
                        <div className="properties-list">
                            <div className="property-row">
                                <span className="property-label">Status</span>
                                <span className="property-value">
                                    <StatusBadge status={ticket.status} />
                                </span>
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
                                <span className="property-label">Customer</span>
                                <span className="property-value">{ticket.createdByName}</span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Assigned Agent</span>
                                <span className="property-value">
                                    {ticket.assignedToName || <span className="text-muted">Unassigned</span>}
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
