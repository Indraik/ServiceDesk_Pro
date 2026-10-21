import React, { useState } from "react";
import {
    Activity,
    RotateCcw,
    UserCheck,
    MessageSquare,
    Lock,
    AlertTriangle,
    CheckCircle2,
    PlayCircle,
    Clock
} from "lucide-react";

export default function ActivityTimeline({ activity = [] }) {
    const [filterType, setFilterType] = useState("ALL"); // ALL, STATUS, ASSIGNMENT, NOTES

    const categorizeItem = (msg = "") => {
        if (msg.includes("INTERNAL NOTE")) return "NOTE";
        if (msg.includes("status changed")) return "STATUS";
        if (msg.includes("assigned")) return "ASSIGNMENT";
        if (msg.includes("DISPUTE") || msg.includes("REOPEN")) return "DISPUTE";
        if (msg.includes("comment") || msg.includes("reply")) return "COMMENT";
        return "OTHER";
    };

    const getItemMeta = (msg = "") => {
        const type = categorizeItem(msg);
        switch (type) {
            case "NOTE":
                return {
                    icon: Lock,
                    badgeClass: "node-internal",
                    category: "NOTE"
                };
            case "DISPUTE":
                return {
                    icon: AlertTriangle,
                    badgeClass: "node-dispute",
                    category: "DISPUTE"
                };
            case "ASSIGNMENT":
                return {
                    icon: UserCheck,
                    badgeClass: "node-assign",
                    category: "ASSIGNMENT"
                };
            case "STATUS":
                if (msg.includes("RESOLVED")) {
                    return { icon: CheckCircle2, badgeClass: "node-resolved", category: "STATUS" };
                }
                if (msg.includes("IN_PROGRESS")) {
                    return { icon: PlayCircle, badgeClass: "node-progress", category: "STATUS" };
                }
                if (msg.includes("CLOSED")) {
                    return { icon: CheckCircle2, badgeClass: "node-closed", category: "STATUS" };
                }
                return { icon: RotateCcw, badgeClass: "node-status", category: "STATUS" };
            case "COMMENT":
                return {
                    icon: MessageSquare,
                    badgeClass: "node-comment",
                    category: "NOTE"
                };
            default:
                return {
                    icon: Activity,
                    badgeClass: "node-default",
                    category: "OTHER"
                };
        }
    };

    const filtered = activity.filter((item) => {
        if (filterType === "ALL") return true;
        const cat = categorizeItem(item.message || "");
        if (filterType === "STATUS") return cat === "STATUS";
        if (filterType === "ASSIGNMENT") return cat === "ASSIGNMENT";
        if (filterType === "NOTES") return cat === "NOTE" || cat === "COMMENT" || cat === "DISPUTE";
        return true;
    });

    return (
        <div className="detail-card activity-timeline-card">
            <div className="timeline-card-header">
                <div className="timeline-header-title">
                    <Activity size={16} />
                    <h3>Activity Timeline</h3>
                    <span className="timeline-count-chip">{activity.length}</span>
                </div>

                {/* Filter Tabs */}
                <div className="timeline-filter-tabs">
                    <button
                        type="button"
                        className={`timeline-tab-btn ${filterType === "ALL" ? "active" : ""}`}
                        onClick={() => setFilterType("ALL")}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={`timeline-tab-btn ${filterType === "STATUS" ? "active" : ""}`}
                        onClick={() => setFilterType("STATUS")}
                    >
                        Status
                    </button>
                    <button
                        type="button"
                        className={`timeline-tab-btn ${filterType === "ASSIGNMENT" ? "active" : ""}`}
                        onClick={() => setFilterType("ASSIGNMENT")}
                    >
                        Assign
                    </button>
                    <button
                        type="button"
                        className={`timeline-tab-btn ${filterType === "NOTES" ? "active" : ""}`}
                        onClick={() => setFilterType("NOTES")}
                    >
                        Notes
                    </button>
                </div>
            </div>

            <div className="timeline-flow">
                {filtered.length === 0 ? (
                    <div className="timeline-empty-view">
                        <Clock size={20} className="text-muted" />
                        <p className="text-muted timeline-empty">
                            {filterType === "ALL"
                                ? "No audit records logged yet."
                                : `No ${filterType.toLowerCase()} records found.`}
                        </p>
                    </div>
                ) : (
                    filtered.map((item, idx) => {
                        const meta = getItemMeta(item.message || "");
                        const NodeIcon = meta.icon;

                        return (
                            <div className="timeline-node-item" key={idx}>
                                <div className={`timeline-indicator-node ${meta.badgeClass}`}>
                                    <NodeIcon size={12} />
                                </div>
                                <div className="timeline-node-content">
                                    <p className="timeline-message">{item.message}</p>
                                    <span className="timeline-time">
                                        {item.timestamp
                                            ? new Date(item.timestamp).toLocaleString([], {
                                                  dateStyle: "short",
                                                  timeStyle: "medium"
                                              })
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
