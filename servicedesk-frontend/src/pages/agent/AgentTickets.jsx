
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../services/ticketService";

function AgentTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadTickets = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getTickets({
                search: search || undefined,
                status: status || undefined,
                page,
                size: 10,
                sort: "createdAt,desc"
            });

            setTickets(data.content ?? []);
            setTotalPages(data.totalPages ?? 0);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load assigned tickets."
            );
        } finally {
            setLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const changeFilter = (setter, value) => {
        setter(value);
        setPage(0);
    };

    return (
        <div className="tickets-container">
            <h1>Assigned Tickets</h1>
            <p>Tickets assigned to your agent account.</p>

            <div className="ticket-filters">
                <input
                    type="search"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) =>
                        changeFilter(setSearch, e.target.value)
                    }
                />

                <select
                    value={status}
                    onChange={(e) =>
                        changeFilter(setStatus, e.target.value)
                    }
                >
                    <option value="">All statuses</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>

            {error && (
                <p className="error-message" role="alert">{error}</p>
            )}

            {loading ? (
                <p>Loading assigned tickets...</p>
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
                                </tr>
                            </thead>

                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.id}</td>
                                        <td>
                                            <Link
                                                to={`/agent/tickets/${ticket.id}`}
                                            >
                                                {ticket.title}
                                            </Link>
                                        </td>
                                        <td>{ticket.status}</td>
                                        <td>{ticket.priority}</td>
                                        <td>{ticket.category}</td>
                                    </tr>
                                ))}

                                {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan="5">
                                            No assigned tickets found.
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

export default AgentTickets;
