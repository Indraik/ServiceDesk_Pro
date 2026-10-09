
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/dashboardService";

function AgentDashboard() {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDashboard() {
            try {
                const data = await getDashboard();

                if (active) {
                    setDashboard(data);
                }
            } catch (err) {
                console.error(err);

                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load agent dashboard."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <p className="details-message">Loading agent dashboard...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="dashboard-container">
            <h1>Agent Dashboard</h1>
            <p>Welcome, {user?.name}</p>

            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>Assigned Tickets</h3>
                    <p>{dashboard.totalTickets}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Open</h3>
                    <p>{dashboard.openTickets}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Assigned</h3>
                    <p>{dashboard.assignedTickets}</p>
                </div>

                <div className="dashboard-card">
                    <h3>In Progress</h3>
                    <p>{dashboard.inProgressTickets}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Resolved</h3>
                    <p>{dashboard.resolvedTickets}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Closed</h3>
                    <p>{dashboard.closedTickets}</p>
                </div>
            </div>

            <Link
                to="/agent/tickets"
                className="create-ticket-link"
            >
                View Assigned Tickets
            </Link>
        </div>
    );
}

export default AgentDashboard;
