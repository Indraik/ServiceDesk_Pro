
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../services/ticketService";

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [category, setCategory] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadTickets = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getTickets({
                search: search || undefined,
                status: status || undefined,
                priority: priority || undefined,
                category: category || undefined,
                page,
                size: 10,
                sort: "createdAt,desc"
            });

            // Spring Data Page response
            setTickets(data.content ?? []);
            setTotalPages(data.totalPages ?? 0);
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

    const resetPageAndSet = (setter, value) => {
        setter(value);
        setPage(0);
    };

    return (
        <div className="tickets-container">
            <div className="tickets-heading">
                <div>
                    <h1>My Tickets</h1>
                    <p>Track your support requests.</p>
                </div>

                <Link
                    to="/customer/tickets/new"
                    className="create-ticket-link"
                >
                    + Create Ticket
                </Link>
            </div>

            <div className="ticket-filters">
                <input
                    type="search"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) =>
                        resetPageAndSet(setSearch, e.target.value)
                    }
                />

                <select
                    value={status}
                    onChange={(e) =>
                        resetPageAndSet(setStatus, e.target.value)
                    }
                >
                    <option value="">All statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                    value={priority}
                    onChange={(e) =>
                        resetPageAndSet(setPriority, e.target.value)
                    }
                >
                    <option value="">All priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>

                <select
                    value={category}
                    onChange={(e) =>
                        resetPageAndSet(setCategory, e.target.value)
                    }
                >
                    <option value="">All categories</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="NETWORK">Network</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="SECURITY">Security</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            {loading ? (
                <p>Loading tickets...</p>
            ) : (
                <>
                    <div className="tickets-table-wrapper">
                        <table className="tickets-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Category</th>
                                    <th>Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.id}</td>
                                        <td>
                                            <Link
                                                to={`/customer/tickets/${ticket.id}`}
                                            >
                                                {ticket.title}
                                            </Link>
                                        </td>
                                        <td>{ticket.status}</td>
                                        <td>{ticket.priority}</td>
                                        <td>{ticket.category}</td>
                                        <td>
                                            {ticket.createdAt
                                                ? new Date(
                                                    ticket.createdAt
                                                ).toLocaleDateString()
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}

                                {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan="6">
                                            No tickets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {totalPages === 0 ? 0 : page + 1}
                            {" "}of {totalPages}
                        </span>

                        <button
                            disabled={
                                totalPages === 0 ||
                                page >= totalPages - 1
                            }
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default MyTickets;
