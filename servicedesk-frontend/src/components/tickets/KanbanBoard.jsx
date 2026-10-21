import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PriorityBadge, CategoryBadge } from "../common/Badge";
import SlaBadge from "../common/SlaBadge";
import {
    Clock,
    UserCheck,
    PlayCircle,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    GripVertical
} from "lucide-react";

const COLUMNS = [
    { key: "OPEN", label: "Open", icon: Clock, colorClass: "col-open" },
    { key: "ASSIGNED", label: "Assigned", icon: UserCheck, colorClass: "col-assigned" },
    { key: "IN_PROGRESS", label: "In Progress", icon: PlayCircle, colorClass: "col-in-progress" },
    { key: "RESOLVED", label: "Resolved", icon: CheckCircle2, colorClass: "col-resolved" },
    { key: "CLOSED", label: "Closed", icon: ShieldCheck, colorClass: "col-closed" }
];

export default function KanbanBoard({
    tickets = [],
    basePath = "/admin/tickets",
    onStatusChange
}) {
    const [draggedTicketId, setDraggedTicketId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);

    // Group tickets by status
    const grouped = COLUMNS.reduce((acc, col) => {
        acc[col.key] = tickets.filter((t) => t.status === col.key);
        return acc;
    }, {});

    const handleDragStart = (e, ticket) => {
        e.dataTransfer.setData("text/plain", ticket.id.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggedTicketId(ticket.id);
    };

    const handleDragEnd = () => {
        setDraggedTicketId(null);
        setDragOverCol(null);
    };

    const handleDragOver = (e, colKey) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverCol !== colKey) {
            setDragOverCol(colKey);
        }
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverCol(null);
        }
    };

    const handleDrop = (e, targetStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        const ticketIdStr = e.dataTransfer.getData("text/plain");
        const ticketId = Number(ticketIdStr);

        setDraggedTicketId(null);

        if (!ticketId || !onStatusChange) return;

        // Find ticket
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket || ticket.status === targetStatus) return;

        onStatusChange(ticketId, targetStatus, ticket);
    };

    return (
        <div className="kanban-board-container">
            <div className="kanban-columns-track">
                {COLUMNS.map((col) => {
                    const colTickets = grouped[col.key] || [];
                    const Icon = col.icon;
                    const isColOver = dragOverCol === col.key;

                    return (
                        <div
                            key={col.key}
                            className={`kanban-column ${col.colorClass} ${isColOver ? "drag-over" : ""}`}
                            onDragOver={(e) => handleDragOver(e, col.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.key)}
                        >
                            <div className="kanban-column-header">
                                <div className="kanban-column-title">
                                    <Icon size={16} className="col-icon" />
                                    <span>{col.label}</span>
                                </div>
                                <span className="kanban-count-pill">{colTickets.length}</span>
                            </div>

                            <div className={`kanban-cards-list ${isColOver ? "drop-active" : ""}`}>
                                {isColOver && (
                                    <div className="kanban-drop-indicator">
                                        <span>Move to {col.label}</span>
                                    </div>
                                )}

                                {colTickets.length === 0 ? (
                                    <div className="kanban-empty-dropzone">
                                        <span>Drop tickets here</span>
                                    </div>
                                ) : (
                                    colTickets.map((t) => {
                                        const isDragging = draggedTicketId === t.id;
                                        return (
                                            <div
                                                key={t.id}
                                                className={`kanban-ticket-card ${isDragging ? "is-dragging" : ""}`}
                                                draggable={Boolean(onStatusChange)}
                                                onDragStart={(e) => handleDragStart(e, t)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <div className="kanban-card-top">
                                                    <div className="kanban-card-top-left">
                                                        {Boolean(onStatusChange) && (
                                                            <span className="kanban-drag-grip" title="Drag to change status">
                                                                <GripVertical size={13} />
                                                            </span>
                                                        )}
                                                        <span className="id-badge">#{t.id}</span>
                                                    </div>
                                                    <PriorityBadge priority={t.priority} />
                                                </div>

                                                <Link
                                                    to={`${basePath}/${t.id}`}
                                                    className="kanban-card-title"
                                                    title={t.title}
                                                >
                                                    {t.title}
                                                </Link>

                                                {t.description && (
                                                    <p className="kanban-card-desc">
                                                        {t.description.length > 80
                                                            ? t.description.substring(0, 80) + "..."
                                                            : t.description}
                                                    </p>
                                                )}

                                                <div className="kanban-meta-row">
                                                    <CategoryBadge category={t.category} />
                                                    <SlaBadge ticket={t} />
                                                </div>

                                                <div className="kanban-card-footer">
                                                    <div
                                                        className="kanban-card-user"
                                                        title={`Assignee: ${t.assignedToName || "Unassigned"}`}
                                                    >
                                                        <div className="avatar-micro">
                                                            {(t.assignedToName || t.createdByName || "U")
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </div>
                                                        <span className="user-micro-name">
                                                            {t.assignedToName || t.createdByName || "Unassigned"}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={`${basePath}/${t.id}`}
                                                        className="btn btn-ghost btn-sm btn-icon-only"
                                                        title="View Ticket"
                                                    >
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
