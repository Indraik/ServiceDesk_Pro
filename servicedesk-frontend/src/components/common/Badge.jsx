import React from "react";
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    PlayCircle, 
    XCircle, 
    UserCheck,
    Flame,
    ArrowUp,
    Minus,
    ArrowDown
} from "lucide-react";

export function StatusBadge({ status }) {
    if (!status) return null;

    const config = {
        OPEN: { label: "Open", className: "badge-status-open", icon: Clock },
        ASSIGNED: { label: "Assigned", className: "badge-status-assigned", icon: UserCheck },
        IN_PROGRESS: { label: "In Progress", className: "badge-status-in-progress", icon: PlayCircle },
        RESOLVED: { label: "Resolved", className: "badge-status-resolved", icon: CheckCircle2 },
        CLOSED: { label: "Closed", className: "badge-status-closed", icon: CheckCircle2 },
        CANCELLED: { label: "Cancelled", className: "badge-status-cancelled", icon: XCircle }
    };

    const current = config[status] || { label: status, className: "badge-status-default", icon: AlertCircle };
    const Icon = current.icon;

    return (
        <span className={`status-badge ${current.className}`}>
            <Icon size={12} className="badge-icon" />
            <span className="badge-text">{current.label}</span>
        </span>
    );
}

export function PriorityBadge({ priority }) {
    if (!priority) return null;

    const config = {
        CRITICAL: { label: "Critical", className: "badge-priority-critical", icon: Flame },
        HIGH: { label: "High", className: "badge-priority-high", icon: ArrowUp },
        MEDIUM: { label: "Medium", className: "badge-priority-medium", icon: Minus },
        LOW: { label: "Low", className: "badge-priority-low", icon: ArrowDown }
    };

    const current = config[priority] || { label: priority, className: "badge-priority-default", icon: Minus };
    const Icon = current.icon;

    return (
        <span className={`priority-badge ${current.className}`}>
            <Icon size={12} className="badge-icon" />
            <span>{current.label}</span>
        </span>
    );
}

export function CategoryBadge({ category }) {
    if (!category) return null;

    const label = category.replace(/_/g, " ");

    return (
        <span className="category-badge">
            {label}
        </span>
    );
}

export function RoleBadge({ role }) {
    if (!role) return null;

    const roleMap = {
        ADMIN: { label: "Admin", className: "badge-role-admin" },
        AGENT: { label: "Agent", className: "badge-role-agent" },
        CUSTOMER: { label: "Customer", className: "badge-role-customer" }
    };

    const current = roleMap[role] || { label: role, className: "" };

    return (
        <span className={`role-badge ${current.className}`}>
            {current.label}
        </span>
    );
}
