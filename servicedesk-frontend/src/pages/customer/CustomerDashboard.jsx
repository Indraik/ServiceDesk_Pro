import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/dashboardService";
import { Link } from "react-router-dom";
import {
    PlusCircle,
    Ticket,
    Clock,
    UserCheck,
    PlayCircle,
    CheckCircle2,
    ShieldCheck,
    XCircle,
    ArrowRight,
    AlertCircle,
    Sparkles
} from "lucide-react";

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                setLoading(true);
                const data = await getDashboard();
                if (active) {
                    setDashboard(data);
                }
            } catch (err) {
                console.error(err);
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load dashboard metrics."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading-state">
                <div className="spinner lg"></div>
                <p>Loading your support workspace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error-banner">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    const total = dashboard?.totalTickets || 0;
    const open = dashboard?.openTickets || 0;
    const assigned = dashboard?.assignedTickets || 0;
    const inProgress = dashboard?.inProgressTickets || 0;
    const resolved = dashboard?.resolvedTickets || 0;
    const closed = dashboard?.closedTickets || 0;
    const cancelled = dashboard?.cancelledTickets || 0;

    // Calculate percentage for distribution bar
    const openPct = total > 0 ? (open / total) * 100 : 0;
    const assignedPct = total > 0 ? (assigned / total) * 100 : 0;
    const inProgPct = total > 0 ? (inProgress / total) * 100 : 0;
    const resolvedPct = total > 0 ? (resolved / total) * 100 : 0;
    const closedPct = total > 0 ? (closed / total) * 100 : 0;

    return (
        <div className="dashboard-view">
            {/* Top Greeting Banner */}
            <div className="dashboard-banner">
                <div className="banner-content">
                    <div className="banner-greeting">
                        <span className="banner-pill">
                            <Sparkles size={14} /> Customer Self-Service Portal
                        </span>
                        <h1>Welcome, {user?.name || "Customer"} 👋</h1>
                        <p>
                            Track active support tickets, check engineer progress, and confirm completed resolutions.
                        </p>
                    </div>

                    <div className="banner-actions">
                        <Link to="/customer/tickets/new" className="btn btn-primary btn-md">
                            <PlusCircle size={18} />
                            <span>Create Support Ticket</span>
                        </Link>
                        <Link to="/customer/tickets" className="btn btn-secondary btn-md">
                            <Ticket size={18} />
                            <span>View All Tickets</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Resolved Tickets Attention Banner (if any need confirmation to close) */}
            {resolved > 0 && (
                <div className="notice-banner notice-success">
                    <div className="notice-content">
                        <CheckCircle2 size={20} className="notice-icon" />
                        <div>
                            <strong>{resolved} Ticket{resolved > 1 ? "s" : ""} marked as Resolved</strong>
                            <p>An agent has resolved your request. Please review the ticket and formally close it.</p>
                        </div>
                    </div>
                    <Link to="/customer/tickets?status=RESOLVED" className="btn btn-sm btn-success-solid">
                        <span>Review Resolved</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            )}

            {/* Metrics Cards Grid */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Tickets</span>
                        <div className="stat-icon-wrapper stat-total">
                            <Ticket size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value">{total}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">All created requests</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Open</span>
                        <div className="stat-icon-wrapper stat-open">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value">{open}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Awaiting agent assignment</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Assigned</span>
                        <div className="stat-icon-wrapper stat-assigned">
                            <UserCheck size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value">{assigned}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Assigned to an engineer</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">In Progress</span>
                        <div className="stat-icon-wrapper stat-in-progress">
                            <PlayCircle size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value">{inProgress}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Currently under investigation</span>
                    </div>
                </div>

                <div className="stat-card stat-card-highlight">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Resolved</span>
                        <div className="stat-icon-wrapper stat-resolved">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value text-success">{resolved}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Pending your final sign-off</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Closed</span>
                        <div className="stat-icon-wrapper stat-closed">
                            <ShieldCheck size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value">{closed}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Successfully resolved & archived</span>
                    </div>
                </div>
            </div>

            {/* Ticket Distribution Bar */}
            {total > 0 && (
                <div className="distribution-card">
                    <div className="distribution-header">
                        <h3>Status Distribution</h3>
                        <span className="distribution-total">{total} Total Tickets</span>
                    </div>

                    <div className="multi-progress-bar">
                        {openPct > 0 && (
                            <div
                                className="progress-slice slice-open"
                                style={{ width: `${openPct}%` }}
                                title={`Open: ${open}`}
                            />
                        )}
                        {assignedPct > 0 && (
                            <div
                                className="progress-slice slice-assigned"
                                style={{ width: `${assignedPct}%` }}
                                title={`Assigned: ${assigned}`}
                            />
                        )}
                        {inProgPct > 0 && (
                            <div
                                className="progress-slice slice-in-progress"
                                style={{ width: `${inProgPct}%` }}
                                title={`In Progress: ${inProgress}`}
                            />
                        )}
                        {resolvedPct > 0 && (
                            <div
                                className="progress-slice slice-resolved"
                                style={{ width: `${resolvedPct}%` }}
                                title={`Resolved: ${resolved}`}
                            />
                        )}
                        {closedPct > 0 && (
                            <div
                                className="progress-slice slice-closed"
                                style={{ width: `${closedPct}%` }}
                                title={`Closed: ${closed}`}
                            />
                        )}
                    </div>

                    <div className="distribution-legend">
                        <div className="legend-item"><span className="legend-dot open"></span> Open ({open})</div>
                        <div className="legend-item"><span className="legend-dot assigned"></span> Assigned ({assigned})</div>
                        <div className="legend-item"><span className="legend-dot in-progress"></span> In Progress ({inProgress})</div>
                        <div className="legend-item"><span className="legend-dot resolved"></span> Resolved ({resolved})</div>
                        <div className="legend-item"><span className="legend-dot closed"></span> Closed ({closed})</div>
                    </div>
                </div>
            )}
        </div>
    );
}