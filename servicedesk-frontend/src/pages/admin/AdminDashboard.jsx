
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard");
                setDashboard(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load admin dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <p className="page-message">Loading dashboard...</p>;

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    const stats = [
        { label: "Total Tickets", value: dashboard.totalTickets },
        { label: "Open", value: dashboard.openTickets },
        { label: "Assigned", value: dashboard.assignedTickets },
        { label: "In Progress", value: dashboard.inProgressTickets },
        { label: "Resolved", value: dashboard.resolvedTickets },
        { label: "Closed", value: dashboard.closedTickets },
        { label: "Cancelled", value: dashboard.cancelledTickets }
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Monitor and manage ServiceDesk Pro tickets.</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {stats.map((stat) => (
                    <div className="dashboard-card" key={stat.label}>
                        <h3>{stat.label}</h3>
                        <p className="dashboard-number">{stat.value ?? 0}</p>
                    </div>
                ))}
            </div>

            <section className="detail-card">
                <h2>Ticket Management</h2>
                <p>
                    Review tickets, filter requests, and assign tickets
                    to the appropriate support agents.
                </p>

                <Link to="/admin/tickets" className="primary-link">
                    Manage All Tickets
                </Link>
            </section>

            <div className="dashboard-grid">
                <section className="detail-card">
                    <h2>Tickets by Category</h2>
                    {Object.entries(dashboard.categoryCounts || {}).map(
                        ([category, count]) => (
                            <p key={category}>
                                <strong>{category.replaceAll("_", " ")}:</strong>{" "}
                                {count}
                            </p>
                        )
                    )}
                </section>

                <section className="detail-card">
                    <h2>Tickets by Priority</h2>
                    {Object.entries(dashboard.priorityCounts || {}).map(
                        ([priority, count]) => (
                            <p key={priority}>
                                <strong>{priority}:</strong> {count}
                            </p>
                        )
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminDashboard;
