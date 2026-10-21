import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
    addTicketComment,
    updateTicketStatus,
    getTicketById,
    getTicketActivity,
    getTicketComments
} from "../../services/ticketService";
import StatusStepper from "../../components/common/StatusStepper";
import { StatusBadge, PriorityBadge, CategoryBadge, RoleBadge } from "../../components/common/Badge";
import MarkdownContent from "../../components/common/MarkdownContent";
import ActivityTimeline from "../../components/tickets/ActivityTimeline";
import TicketQuickActions from "../../components/tickets/TicketQuickActions";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Send,
    MessageSquare,
    Activity,
    User,
    Calendar,
    AlertCircle,
    ShieldCheck,
    HelpCircle,
    AlertTriangle,
    RotateCcw
} from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { DetailSkeleton } from "../../components/common/Skeleton";

export default function TicketDetails() {
    const { ticketId } = useParams();
    const { success: toastSuccess, error: toastError, confirm } = useToast();

    const [ticket, setTicket] = useState(null);
    const [activity, setActivity] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState("");

    const [closing, setClosing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusError, setStatusError] = useState("");

    // Dispute / Reopen request modal state
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputeReason, setDisputeReason] = useState("");
    const [submittingDispute, setSubmittingDispute] = useState(false);

    const loadDetails = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
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
    }, [ticketId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    const handleCloseTicket = async () => {
        const confirmed = await confirm({
            title: "Confirm Ticket Resolution",
            message: "Are you sure you want to formally close this resolved ticket? This action marks the issue as resolved and concludes support.",
            confirmText: "Confirm & Close",
            cancelText: "Keep Open",
            type: "danger"
        });
        if (!confirmed) return;

        try {
            setClosing(true);
            setStatusMessage("");
            setStatusError("");

            await updateTicketStatus(ticketId, "CLOSED");

            const [updatedTicket, updatedActivity, updatedComments] =
                await Promise.all([
                    getTicketById(ticketId),
                    getTicketActivity(ticketId),
                    getTicketComments(ticketId)
                ]);

            setTicket(updatedTicket);
            setActivity(Array.isArray(updatedActivity) ? updatedActivity : []);
            setComments(Array.isArray(updatedComments) ? updatedComments : []);
            toastSuccess("Ticket successfully confirmed and closed.");
            setStatusMessage("Ticket successfully confirmed and closed.");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Unable to close ticket.";
            toastError(msg);
            setStatusError(msg);
        } finally {
            setClosing(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmittingComment(true);
            setCommentError("");

            await addTicketComment(ticketId, newComment.trim());
            setNewComment("");

            const [updatedComments, updatedActivity] = await Promise.all([
                getTicketComments(ticketId),
                getTicketActivity(ticketId)
            ]);

            setComments(Array.isArray(updatedComments) ? updatedComments : []);
            setActivity(Array.isArray(updatedActivity) ? updatedActivity : []);
        } catch (err) {
            console.error(err);
            setCommentError(
                err.response?.data?.message ||
                "Failed to post comment. Please try again."
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDisputeSubmit = async (e) => {
        e.preventDefault();
        if (!disputeReason.trim()) return;

        try {
            setSubmittingDispute(true);
            const disputeContent = `⚠️ [REOPEN / DISPUTE REQUEST]\n${disputeReason.trim()}`;
            await addTicketComment(ticketId, disputeContent);
            setDisputeReason("");
            setShowDisputeModal(false);

            const [updatedTicket, updatedComments, updatedActivity] = await Promise.all([
                getTicketById(ticketId),
                getTicketComments(ticketId),
                getTicketActivity(ticketId)
            ]);

            setTicket(updatedTicket);
            setComments(Array.isArray(updatedComments) ? updatedComments : []);
            setActivity(Array.isArray(updatedActivity) ? updatedActivity : []);
            toastSuccess("Resolution dispute submitted. The support engineering team has been notified.");
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.message || "Failed to submit dispute.");
        } finally {
            setSubmittingDispute(false);
        }
    };

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error || !ticket) {
        return (
            <div className="tickets-page-view">
                <div className="dashboard-error-banner">
                    <AlertCircle size={20} />
                    <span>{error || "Ticket not found."}</span>
                </div>
                <Link to="/customer/tickets" className="btn btn-secondary btn-sm">
                    Back to My Tickets
                </Link>
            </div>
        );
    }

    const isResolved = ticket.status === "RESOLVED";
    const hasDispute = comments.some((c) => c.content?.includes("⚠️ [REOPEN / DISPUTE REQUEST]"));

    return (
        <div className="ticket-detail-view">
            {/* Header */}
            <div className="detail-header-row">
                <Link to="/customer/tickets" className="back-nav-link">
                    <ArrowLeft size={16} />
                    <span>Back to My Tickets</span>
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
                    </div>
                </div>

                <div className="detail-header-actions">
                    <TicketQuickActions onRefresh={loadDetails} isRefreshing={loading} />
                </div>
            </div>

            {/* Visual Status Stepper */}
            <div className="detail-card stepper-container-card">
                <StatusStepper currentStatus={ticket.status} />
            </div>

            {/* Resolved Notice & Close Action */}
            {isResolved && (
                hasDispute ? (
                    <div className="action-highlight-banner notice-warning">
                        <div className="banner-text-group">
                            <AlertTriangle size={22} className="text-warning" />
                            <div>
                                <strong>Resolution Dispute Under Review</strong>
                                <p>
                                    You reported this issue as unresolved. The support engineering team has been alerted and will post an update shortly.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloseTicket}
                            disabled={closing}
                            className="btn btn-secondary btn-sm"
                        >
                            {closing ? "Closing..." : "Close Ticket Anyway"}
                        </button>
                    </div>
                ) : (
                    <div className="action-highlight-banner notice-success">
                        <div className="banner-text-group">
                            <CheckCircle2 size={22} className="text-success" />
                            <div>
                                <strong>Resolution Ready for Review</strong>
                                <p>
                                    The assigned support engineer has marked this issue as resolved.
                                    If your issue is settled, please confirm to close the ticket.
                                </p>
                            </div>
                        </div>
                        <div className="action-button-group">
                            <button
                                type="button"
                                onClick={() => setShowDisputeModal(true)}
                                disabled={closing}
                                className="btn btn-warning-solid btn-md"
                            >
                                <RotateCcw size={15} />
                                <span>Reopen / Dispute</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseTicket}
                                disabled={closing}
                                className="btn btn-success-solid btn-md"
                            >
                                {closing ? "Closing..." : "Confirm & Close Ticket"}
                            </button>
                        </div>
                    </div>
                )
            )}

            {statusMessage && (
                <div className="dashboard-success-banner">
                    <CheckCircle2 size={18} />
                    <span>{statusMessage}</span>
                </div>
            )}

            {statusError && (
                <div className="dashboard-error-banner">
                    <AlertCircle size={18} />
                    <span>{statusError}</span>
                </div>
            )}

            {/* 2-Column Content Layout */}
            <div className="ticket-detail-grid">
                {/* Left / Main Column */}
                <div className="ticket-main-col">
                    {/* Description Card */}
                    <div className="detail-card">
                        <div className="detail-section-title">
                            <h3>Issue Description</h3>
                        </div>
                        <div className="ticket-description-body">
                            <MarkdownContent content={ticket.description} />
                        </div>
                    </div>

                    {/* Comments & Discussion */}
                    <div className="detail-card comments-card">
                        <div className="detail-section-title">
                            <div className="title-with-count">
                                <MessageSquare size={18} />
                                <h3>Discussion ({comments.filter((c) => !c.content?.startsWith("🔒 [INTERNAL NOTE]")).length})</h3>
                            </div>
                        </div>

                        {/* Comment List */}
                        <div className="comments-thread">
                            {comments.filter((c) => !c.content?.startsWith("🔒 [INTERNAL NOTE]")).length === 0 ? (
                                <p className="text-muted empty-thread-text">
                                    No messages yet. Send a comment below to communicate with the support team.
                                </p>
                            ) : (
                                comments
                                    .filter((c) => !c.content?.startsWith("🔒 [INTERNAL NOTE]"))
                                    .map((c) => {
                                    const authorName = c.createdByName || c.authorName || "User";
                                    const authorRole = c.createdByRole || c.authorRole;
                                    const authorInitials = authorName.substring(0, 2).toUpperCase();
                                    return (
                                        <div className="comment-bubble" key={c.id}>
                                            <div className="comment-avatar">
                                                {authorInitials}
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <span className="comment-author">{authorName}</span>
                                                    {authorRole && <RoleBadge role={authorRole} />}
                                                    <span className="comment-time">
                                                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                                                    </span>
                                                </div>
                                                <div className="comment-text">
                                                    <MarkdownContent content={c.content} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* New Comment Composer */}
                        {ticket.status !== "CLOSED" && ticket.status !== "CANCELLED" ? (
                            <form onSubmit={handleCommentSubmit} className="comment-composer">
                                {commentError && (
                                    <div className="comment-error-text">
                                        <AlertCircle size={14} />
                                        <span>{commentError}</span>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a reply or provide additional details..."
                                    rows={3}
                                    className="form-control"
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
                                                <span>Send Reply</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="closed-ticket-notice">
                                <ShieldCheck size={16} />
                                <span>This ticket is closed. Further comments are disabled.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right / Sidebar Column */}
                <div className="ticket-side-col">
                    {/* Ticket Properties */}
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
                                <span className="property-label">Assigned Agent</span>
                                <span className="property-value">
                                    {ticket.assignedToName || (
                                        <span className="text-muted">Unassigned</span>
                                    )}
                                </span>
                            </div>
                            <div className="property-row">
                                <span className="property-label">Created By</span>
                                <span className="property-value">{ticket.createdByName}</span>
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

                    {/* Activity Timeline */}
                    <ActivityTimeline activity={activity} />
                </div>
            </div>

            {/* Dispute Resolution Modal */}
            {showDisputeModal && (
                <div
                    className="modal-backdrop"
                    onClick={() => !submittingDispute && setShowDisputeModal(false)}
                >
                    <div
                        className="confirm-modal-box"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="confirm-modal-header">
                            <div className="modal-icon-badge badge-warning">
                                <RotateCcw size={22} />
                            </div>
                            <h3 className="modal-title">Dispute Resolution & Request Reopen</h3>
                        </div>

                        <form onSubmit={handleDisputeSubmit}>
                            <div className="confirm-modal-body">
                                <p style={{ marginBottom: "1rem" }}>
                                    Please explain what problem remains unresolved or why the issue requires further support investigation:
                                </p>
                                <textarea
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    placeholder="Explain what is still not working or provide new error logs..."
                                    rows={4}
                                    className="form-control"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="confirm-modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={submittingDispute}
                                    onClick={() => setShowDisputeModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDispute || !disputeReason.trim()}
                                    className="btn btn-warning-solid btn-sm"
                                >
                                    {submittingDispute ? "Submitting Dispute..." : "Submit Dispute Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
