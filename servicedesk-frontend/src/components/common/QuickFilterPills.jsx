import React from "react";
import {
    Flame,
    Clock,
    PlayCircle,
    CheckCircle2,
    ShieldAlert,
    Inbox
} from "lucide-react";

export default function QuickFilterPills({
    currentStatus = "",
    currentPriority = "",
    onFilterChange,
    role = "ADMIN"
}) {
    // Generate role-specific quick filter chips
    const pills = [
        {
            id: "all",
            label: "All Tickets",
            icon: Inbox,
            isActive: !currentStatus && !currentPriority,
            apply: () => onFilterChange({ status: "", priority: "" })
        },
        {
            id: "critical",
            label: "Critical Only",
            icon: Flame,
            colorClass: "pill-critical",
            isActive: currentPriority === "CRITICAL",
            apply: () => onFilterChange({ priority: "CRITICAL" })
        },
        ...(role === "ADMIN" || role === "CUSTOMER"
            ? [
                  {
                      id: "open",
                      label: "Open",
                      icon: Clock,
                      colorClass: "pill-open",
                      isActive: currentStatus === "OPEN",
                      apply: () => onFilterChange({ status: "OPEN" })
                  }
              ]
            : []),
        {
            id: "in_progress",
            label: "In Progress",
            icon: PlayCircle,
            colorClass: "pill-in-progress",
            isActive: currentStatus === "IN_PROGRESS",
            apply: () => onFilterChange({ status: "IN_PROGRESS" })
        },
        {
            id: "resolved",
            label: "Resolved",
            icon: CheckCircle2,
            colorClass: "pill-resolved",
            isActive: currentStatus === "RESOLVED",
            apply: () => onFilterChange({ status: "RESOLVED" })
        },
        {
            id: "high_priority",
            label: "High Priority",
            icon: ShieldAlert,
            colorClass: "pill-high",
            isActive: currentPriority === "HIGH",
            apply: () => onFilterChange({ priority: "HIGH" })
        }
    ];

    return (
        <div className="quick-filter-pills-bar">
            <span className="pills-label">Quick Filters:</span>
            <div className="pills-track">
                {pills.map((pill) => {
                    const Icon = pill.icon;
                    return (
                        <button
                            key={pill.id}
                            type="button"
                            className={`filter-pill ${pill.colorClass || ""} ${
                                pill.isActive ? "active" : ""
                            }`}
                            onClick={pill.apply}
                        >
                            <Icon size={13} className="pill-icon" />
                            <span>{pill.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
