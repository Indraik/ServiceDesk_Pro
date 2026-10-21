import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
    Ticket,
    Clock,
    UserCheck,
    PlayCircle,
    CheckCircle2,
    ShieldCheck,
    XCircle,
    Shield,
    Users,
    Layers,
    AlertCircle,
    ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const response = await api.get("/dashboard");
                if (active) {
                    setDashboard(response.data);
                }
            } catch (err) {
                console.error(err);
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load admin dashboard."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading-state">
                <div className="spinner lg"></div>
                <p>Loading enterprise analytics...</p>
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

    const stats = [
        { label: "Total Tickets", value: total, icon: Ticket, class: "stat-total" },
        { label: "Open (Unassigned)", value: open, icon: Clock, class: "stat-open", highlight: open > 0 },
        { label: "Assigned", value: assigned, icon: UserCheck, class: "stat-assigned" },
        { label: "In Progress", value: inProgress, icon: PlayCircle, class: "stat-in-progress" },
        { label: "Resolved", value: resolved, icon: CheckCircle2, class: "stat-resolved" },
        { label: "Closed", value: closed, icon: ShieldCheck, class: "stat-closed" },
        { label: "Cancelled", value: cancelled, icon: XCircle, class: "stat-cancelled" }
    ];

    return (
        <div className="dashboard-view">
            {/* Top Greeting Banner */}
            <div className="dashboard-banner">
                <div className="banner-content">
                    <div className="banner-greeting">
                        <span className="banner-pill">
                            <Shield size={14} /> Administration & Operations
                        </span>
                        <h1>System Health & Ticket Operations 🛡️</h1>
                        <p>
                            Supervise organization-wide support volume, dispatch open requests to technical agents,
                            and monitor resolution metrics.
                        </p>
                    </div>

                    <div className="banner-actions">
                        <Link to="/admin/tickets" className="btn btn-primary btn-md">
                            <Layers size={18} />
                            <span>Manage All Tickets</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Unassigned Tickets Alert */}
            {open > 0 && (
                <div className="notice-banner notice-warning">
                    <div className="notice-content">
                        <Clock size={20} className="notice-icon" />
                        <div>
                            <strong>{open} New Ticket{open > 1 ? "s" : ""} require agent assignment</strong>
                            <p>Assign these open requests to available engineers to maintain SLA response targets.</p>
                        </div>
                    </div>
                    <Link to="/admin/tickets?status=OPEN" className="btn btn-sm btn-warning-solid">
                        <span>Dispatch Tickets</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            )}

            {/* Metrics Cards Grid */}
            <div className="stat-cards-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className={`stat-card ${stat.highlight ? "stat-card-highlight" : ""}`}
                        >
                            <div className="stat-card-header">
                                <span className="stat-card-title">{stat.label}</span>
                                <div className={`stat-icon-wrapper ${stat.class}`}>
                                    <Icon size={18} />
                                </div>
                            </div>
                            <div className="stat-card-value">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* Breakdown Charts Grid */}
            <div className="dashboard-double-panel">
                {/* Tickets by Category */}
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <Layers size={18} className="analytics-icon" />
                        <h3>Tickets by Category</h3>
                    </div>
                    <div className="analytics-list">
                        {Object.entries(dashboard.categoryCounts || {}).map(([category, count]) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div className="analytics-bar-row" key={category}>
                                    <div className="bar-labels">
                                        <span className="bar-name">
                                            {category.replace(/_/g, " ")}
                                        </span>
                                        <span className="bar-meta">
                                            <strong>{count}</strong> ({pct}%)
                                        </span>
                                    </div>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill category-fill"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tickets by Priority */}
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <AlertCircle size={18} className="analytics-icon" />
                        <h3>Tickets by Priority</h3>
                    </div>
                    <div className="analytics-list">
                        {Object.entries(dashboard.priorityCounts || {}).map(([priority, count]) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            const priorityClass = `priority-${priority.toLowerCase()}`;
                            return (
                                <div className="analytics-bar-row" key={priority}>
                                    <div className="bar-labels">
                                        <span className="bar-name">{priority}</span>
                                        <span className="bar-meta">
                                            <strong>{count}</strong> ({pct}%)
                                        </span>
                                    </div>
                                    <div className="bar-track">
                                        <div
                                            className={`bar-fill ${priorityClass}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
