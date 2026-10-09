
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getTicketById,
    getAgents,
    assignTicket
} from "../../services/ticketService";

function AdminTicketDetails() {
    const { ticketId } = useParams();

    const [ticket, setTicket] = useState(null);
    const [agents, setAgents] = useState([]);
    const [agentId, setAgentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [ticketData, agentData] = await Promise.all([
                getTicketById(ticketId),
                getAgents()
            ]);

            setTicket(ticketData);
            setAgents(agentData);
            setAgentId("");
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
        loadData();
    }, [ticketId]);

    const handleAssign = async (event) => {
        event.preventDefault();

        if (!agentId) {
            setError("Please select an agent.");
            return;
        }

        if (ticket?.status !== "OPEN") {
            setError("Only OPEN tickets can be assigned.");
            return;
        }

        try {
            setAssigning(true);
            setError("");
            setSuccess("");

            const updatedTicket = await assignTicket(ticketId, agentId);

            setTicket(updatedTicket);
            setAgentId("");
            setSuccess("Ticket assigned successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign ticket."
            );
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return <p className="page-message">Loading ticket details...</p>;
    }

    if (!ticket) {
        return (
            <div className="page-container">
                <p className="error-message">
                    {error || "Ticket not found or access denied."}
                </p>
                <Link to="/admin/tickets">Back to All Tickets</Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Link to="/admin/tickets" className="back-link">
                ← Back to All Tickets
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
            {success && <p className="success-message">{success}</p>}

            <section className="detail-card">
                <h2>Ticket Information</h2>

                <p><strong>Title:</strong> {ticket.title}</p>
                <p><strong>Description:</strong> {ticket.description}</p>
                <p><strong>Customer:</strong> {ticket.createdByName}</p>
                <p><strong>Priority:</strong> {ticket.priority}</p>
                <p><strong>Category:</strong> {ticket.category}</p>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p>
                    <strong>Current Agent:</strong>{" "}
                    {ticket.assignedToName || "Unassigned"}
                </p>
            </section>

            <section className="detail-card">
                <h2>Assign Ticket to Agent</h2>

                {ticket.status !== "OPEN" ? (
                    <p>
                        Only OPEN tickets can be assigned using the current
                        backend workflow.
                    </p>
                ) : agents.length === 0 ? (
                    <p>No agents are available. Register an AGENT account first.</p>
                ) : (
                    <form onSubmit={handleAssign} className="comment-form">
                        <label htmlFor="agentId">Select Agent</label>

                        <select
                            id="agentId"
                            value={agentId}
                            onChange={(event) => setAgentId(event.target.value)}
                            required
                        >
                            <option value="">Choose an agent</option>
                            {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name} — {agent.email}
                                </option>
                            ))}
                        </select>

                        <button type="submit" disabled={assigning}>
                            {assigning ? "Assigning..." : "Assign Agent"}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
}

export default AdminTicketDetails;
