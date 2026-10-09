
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    addTicketComment,
    updateTicketStatus,
    getTicketById,
    getTicketActivity,
    getTicketComments
} from "../../services/ticketService";


function TicketDetails() {
    const { ticketId } = useParams();

    const [ticket, setTicket] = useState(null);
    const [activity, setActivity] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDetails() {
            setLoading(true);
            setError("");

            try {
                const [ticketData, activityData, commentsData] =
                    await Promise.all([
                        getTicketById(ticketId),
                        getTicketActivity(ticketId),
                        getTicketComments(ticketId)
                    ]);

                if (active) {
                    setTicket(ticketData);
                    setActivity(Array.isArray(activityData) ? activityData : []);
                    setComments(Array.isArray(commentsData) ? commentsData : []);
                }
            } catch (err) {
                console.error(err);

                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load ticket details."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDetails();

        return () => {
            active = false;
        };
    }, [ticketId]);


    const [closing, setClosing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusError, setStatusError] = useState("");

    const handleCloseTicket = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to close this resolved ticket?"
        );

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

            setStatusMessage("Ticket closed successfully.");
        } catch (err) {
            setStatusError(
                err.response?.data?.message ||
                "Unable to close the ticket."
            );
        } finally {
            setClosing(false);
        }
    };

    const handleAddComment = async (event) => {
        event.preventDefault();

        const content = newComment.trim();

        if (!content) {
            setCommentError("Please enter a comment.");
            return;
        }

        setSubmittingComment(true);
        setCommentError("");

        try {
            await addTicketComment(ticketId, content);

            const [updatedComments, updatedActivity] = await Promise.all([
                getTicketComments(ticketId),
                getTicketActivity(ticketId)
            ]);

            setComments(updatedComments);
            setActivity(updatedActivity);
            setNewComment("");
        } catch (err) {
            console.error(err);

            setCommentError(
                err.response?.data?.message ||
                "Unable to add comment. Please try again."
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return <p className="details-message">Loading ticket details...</p>;
    }

    if (error) {
        return (
            <div className="details-message">
                <p className="error-message">{error}</p>
                <Link to="/customer/tickets">Back to My Tickets</Link>
            </div>
        );
    }

    if (!ticket) {
        return <p className="details-message">Ticket not found.</p>;
    }

    return (
        <div className="ticket-details-container">
            <Link to="/customer/tickets">← Back to My Tickets</Link>

            <div className="ticket-details-card">
                <p className="ticket-reference">Ticket #{ticket.id}</p>
                <h1>{ticket.title}</h1>

                <div className="ticket-badges">
                    <span>{ticket.status}</span>
                    <span>{ticket.priority}</span>
                    <span>{ticket.category}</span>
                </div>

                {statusMessage && (
                    <p className="success-message">{statusMessage}</p>
                )}

                {statusError && (
                    <p className="error-message">{statusError}</p>
                )}

                {ticket.status === "RESOLVED" && (
                    <button
                        type="button"
                        onClick={handleCloseTicket}
                        disabled={closing}
                    >
                        {closing ? "Closing..." : "Close Ticket"}
                    </button>
                )}

                <h2>Description</h2>
                <p className="ticket-description">{ticket.description}</p>

                <div className="ticket-metadata">
                    <p>
                        <strong>Created by:</strong>{" "}
                        {ticket.createdByName ?? "—"}
                    </p>
                    <p>
                        <strong>Assigned to:</strong>{" "}
                        {ticket.assignedToName ?? "Unassigned"}
                    </p>
                    <p>
                        <strong>Created:</strong>{" "}
                        {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleString()
                            : "—"}
                    </p>
                    <p>
                        <strong>Last updated:</strong>{" "}
                        {ticket.updatedAt
                            ? new Date(ticket.updatedAt).toLocaleString()
                            : "—"}
                    </p>
                </div>
            </div>

            <section className="ticket-details-card">
                <h2>Comments</h2>

                <form onSubmit={handleAddComment} className="comment-form">
                    <label htmlFor="newComment">Add a comment</label>

                    <textarea
                        id="newComment"
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        rows={3}
                        maxLength={2000}
                        placeholder="Write your comment..."
                        required
                    />

                    {commentError && (
                        <p className="error-message" role="alert">
                            {commentError}
                        </p>
                    )}

                    <button type="submit" disabled={submittingComment}>
                        {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                </form>

                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    <div className="comments-list">
                        {comments.map((comment) => (
                            <article key={comment.id} className="comment-item">
                                <p>{comment.content ?? comment.message}</p>
                                <small>
                                    {comment.createdByName ?? comment.authorName ?? "User"}
                                    {" · "}
                                    {comment.createdAt
                                        ? new Date(comment.createdAt).toLocaleString()
                                        : ""}
                                </small>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="ticket-details-card">
                <h2>Activity Timeline</h2>

                {activity.length === 0 ? (
                    <p>No activity recorded.</p>
                ) : (
                    <div className="activity-list">
                        {activity.map((item, index) => (
                            <article
                                key={item.id ?? `${item.type}-${item.timestamp}-${index}`}
                                className="activity-item"
                            >
                                <p>{item.message}</p>
                                <small>
                                    {item.performedBy ?? "System"}
                                    {" · "}
                                    {item.timestamp
                                        ? new Date(item.timestamp).toLocaleString()
                                        : ""}
                                </small>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default TicketDetails;
