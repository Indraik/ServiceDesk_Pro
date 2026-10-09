
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../services/ticketService";

function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [category, setCategory] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        } catch (err) {
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

    const handleSearch = (event) => {
        event.preventDefault();
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

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>All Tickets</h1>
                    <p>Review tickets and manage assignments.</p>
                </div>

                <Link to="/admin/dashboard" className="back-link">
                    Back to Dashboard
                </Link>
            </div>

            <form onSubmit={handleSearch} className="ticket-filters">
                <input
                    type="text"
                    placeholder="Search title or description"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
                        setPage(0);
                    }}
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
                    onChange={(event) => {
                        setPriority(event.target.value);
                        setPage(0);
                    }}
                >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>

                <select
                    value={category}
                    onChange={(event) => {
                        setCategory(event.target.value);
                        setPage(0);
                    }}
                >
                    <option value="">All Categories</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="NETWORK">Network</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="SECURITY">Security</option>
                    <option value="OTHER">Other</option>
                </select>

                <button type="submit">Search</button>
                <button type="button" onClick={clearFilters}>
                    Clear Filters
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p className="page-message">Loading tickets...</p>
            ) : (
                <>
                    <div className="table-container">
                        <table className="ticket-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Customer</th>
                                    <th>Agent</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Category</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">No tickets found.</td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.id}</td>
                                            <td>{ticket.title}</td>
                                            <td>{ticket.createdByName}</td>
                                            <td>{ticket.assignedToName || "Unassigned"}</td>
                                            <td>{ticket.status?.replaceAll("_", " ")}</td>
                                            <td>{ticket.priority}</td>
                                            <td>{ticket.category}</td>
                                            <td>
                                                <Link
                                                    to={`/admin/tickets/${ticket.id}`}
                                                >
                                                    View / Assign
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                        </span>

                        <button
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminTickets;
