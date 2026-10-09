
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

function AgentTicketDetails() {
    const { ticketId } = useParams();
    const { user } = useAuth();

    const [ticket, setTicket] = useState(null);
    const [activity, setActivity] = useState([]);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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
            setActivity(activityData);
            setComments(commentsData);
        } catch (err) {
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

    const handleCommentSubmit = async (event) => {
        event.preventDefault();

        if (!comment.trim()) return;

        try {
            setSubmitting(true);
            setError("");

            await addTicketComment(ticketId, comment.trim());
            setComment("");

            await loadTicketData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add comment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        const confirmed = window.confirm(
            `Change ticket status to ${status}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            await updateTicketStatus(ticketId, status);
            await loadTicketData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update ticket status."
            );
        }
    };

    if (loading) return <p className="page-message">Loading ticket...</p>;

    if (!ticket) {
        return (
            <div className="page-container">
                <p className="error-message">
                    {error || "Ticket not found or access denied."}
                </p>
                <Link to="/agent/tickets">Back to tickets</Link>
            </div>
        );
    }

    const canStartWork =
        ticket.status === "ASSIGNED" &&
        ticket.assignedToId === user?.id;

    const canResolve =
        ticket.status === "IN_PROGRESS" &&
        ticket.assignedToId === user?.id;

    return (
        <div className="page-container">
            <Link to="/agent/tickets" className="back-link">
                ← Back to tickets
            </Link>

            <div className="page-header">
                <div>
                    <h1>Ticket #{ticket.id}</h1>
                    <p>{ticket.title}</p>
                </div>

                <span className={`status-badge status-${ticket.status}`}>
                    {ticket.status?.replaceAll("_", " ")}
                </span>
            </div>

            {error && <p className="error-message">{error}</p>}

            <section className="detail-card">
                <h2>Ticket Information</h2>

                <p><strong>Description:</strong> {ticket.description}</p>
                <p><strong>Priority:</strong> {ticket.priority}</p>
                <p><strong>Category:</strong> {ticket.category}</p>
                <p><strong>Created by:</strong> {ticket.createdByName}</p>
                <p><strong>Assigned agent:</strong> {ticket.assignedToName || "Not assigned"}</p>
                <p><strong>Created at:</strong> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "—"}</p>

                <div className="action-buttons">
                    {canStartWork && (
                        <button
                            onClick={() => handleStatusUpdate("IN_PROGRESS")}
                        >
                            Start Working
                        </button>
                    )}

                    {canResolve && (
                        <button
                            onClick={() => handleStatusUpdate("RESOLVED")}
                        >
                            Mark Resolved
                        </button>
                    )}
                </div>
            </section>

            <section className="detail-card">
                <h2>Comments</h2>

                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    comments.map((item) => (
                        <div className="comment-item" key={item.id}>
                            <p>{item.content}</p>
                            <small>
                                {item.userName || item.createdByName || "User"}
                                {" · "}
                                {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString()
                                    : ""}
                            </small>
                        </div>
                    ))
                )}

                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Write an update..."
                        rows="3"
                        required
                    />

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Adding..." : "Add Comment"}
                    </button>
                </form>
            </section>

            <section className="detail-card">
                <h2>Activity Timeline</h2>

                {activity.length === 0 ? (
                    <p>No activity recorded yet.</p>
                ) : (
                    activity.map((item, index) => (
                        <div
                            className="activity-item"
                            key={item.id ?? `${item.type}-${item.timestamp}-${index}`}
                        >
                            <p><strong>{item.type}</strong></p>
                            <p>{item.message}</p>
                            <small>
                                {item.performedBy || "System"}
                                {" · "}
                                {item.timestamp
                                    ? new Date(item.timestamp).toLocaleString()
                                    : ""}
                            </small>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

export default AgentTicketDetails;
