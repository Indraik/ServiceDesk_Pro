import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/dashboardService";
import { Link } from "react-router-dom";


function CustomerDashboard() {

    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const data = await getDashboard();

                setDashboard(data);

            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard"
                );

            } finally {

                setLoading(false);

            }
        };

        loadDashboard();

    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>

            <h1>Customer Dashboard</h1>

            <p>
                Welcome, {user?.name}
            </p>
            <Link to="/customer/tickets/new" className="create-ticket-link">
                + Create Ticket
            </Link>

            <Link to="/customer/tickets" className="create-ticket-link">
                My Tickets
            </Link>

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <h3>Total Tickets</h3>
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

                <div className="dashboard-card">
                    <h3>Cancelled</h3>
                    <p>{dashboard.cancelledTickets}</p>
                </div>

            </div>

        </div>
    );
}

export default CustomerDashboard;