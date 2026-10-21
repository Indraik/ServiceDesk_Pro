import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/dashboardService";
import {
    Ticket,
    UserCheck,
    PlayCircle,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    AlertCircle,
    Zap,
    Briefcase
} from "lucide-react";

export default function AgentDashboard() {
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
                        "Unable to load agent dashboard."
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
                <p>Loading agent workspace...</p>
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
    const assigned = dashboard?.assignedTickets || 0;
    const inProgress = dashboard?.inProgressTickets || 0;
    const resolved = dashboard?.resolvedTickets || 0;
    const closed = dashboard?.closedTickets || 0;

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
                            <Zap size={14} /> Agent Resolution Workspace
                        </span>
                        <h1>Agent Worklist: {user?.name || "Agent"} ⚡</h1>
                        <p>
                            Review tickets assigned to you, advance issues to In Progress, and submit solutions when resolved.
                        </p>
                    </div>

                    <div className="banner-actions">
                        <Link to="/agent/tickets" className="btn btn-primary btn-md">
                            <Briefcase size={18} />
                            <span>Go to Assigned Tickets ({assigned + inProgress})</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Assigned Tickets</span>
                        <div className="stat-icon-wrapper stat-total">
                            <Ticket size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value">{total}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Total assigned under your queue</span>
                    </div>
                </div>

                <div className="stat-card stat-card-highlight">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Pending Start</span>
                        <div className="stat-icon-wrapper stat-assigned">
                            <UserCheck size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value text-accent">{assigned}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Assigned, waiting for In-Progress</span>
                    </div>
                </div>

                <div className="stat-card stat-card-highlight">
                    <div className="stat-card-header">
                        <span className="stat-card-title">In Progress</span>
                        <div className="stat-icon-wrapper stat-in-progress">
                            <PlayCircle size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value text-warning">{inProgress}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Currently being resolved</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Resolved</span>
                        <div className="stat-icon-wrapper stat-resolved">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value text-success">{resolved}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Awaiting customer closure</span>
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
                        <span className="stat-footer-text">Completed & approved</span>
                    </div>
                </div>
            </div>

            {/* Workload Distribution */}
            {total > 0 && (
                <div className="distribution-card">
                    <div className="distribution-header">
                        <h3>Your Queue Breakdown</h3>
                        <span className="distribution-total">{total} Tickets Total</span>
                    </div>

                    <div className="multi-progress-bar">
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
