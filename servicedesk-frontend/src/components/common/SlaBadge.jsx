import React from "react";
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";

/**
 * Calculates SLA status based on Priority and createdAt timestamp.
 * SLA Targets (Resolution):
 *  - CRITICAL: 8 hours
 *  - HIGH: 24 hours
 *  - MEDIUM: 48 hours
 *  - LOW: 72 hours
 */
export function getSlaDetails(ticket) {
    if (!ticket || !ticket.createdAt) return null;

    const isResolvedOrClosed = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

    const targetHoursMap = {
        CRITICAL: 8,
        HIGH: 24,
        MEDIUM: 48,
        LOW: 72
    };

    const targetHours = targetHoursMap[ticket.priority] || 48;
    const createdTime = new Date(ticket.createdAt).getTime();
    const deadlineTime = createdTime + targetHours * 60 * 60 * 1000;
    const now = Date.now();

    if (isResolvedOrClosed) {
        return {
            status: "MET",
            label: "SLA Met",
            className: "sla-met",
            icon: CheckCircle2
        };
    }

    const remainingMs = deadlineTime - now;

    if (remainingMs <= 0) {
        const breachedHours = Math.abs(Math.round(remainingMs / (1000 * 60 * 60)));
        return {
            status: "BREACHED",
            label: breachedHours > 0 ? `SLA Breached (+${breachedHours}h)` : "SLA Breached",
            className: "sla-breached",
            icon: AlertOctagon
        };
    }

    const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));
    const totalDurationMs = targetHours * 60 * 60 * 1000;
    const percentRemaining = (remainingMs / totalDurationMs) * 100;

    if (percentRemaining < 25 || remainingHours <= 2) {
        return {
            status: "WARNING",
            label: `${remainingHours}h remaining`,
            className: "sla-warning",
            icon: AlertTriangle
        };
    }

    return {
        status: "ON_TRACK",
        label: `${remainingHours}h remaining`,
        className: "sla-ontrack",
        icon: Clock
    };
}

export default function SlaBadge({ ticket }) {
    const sla = getSlaDetails(ticket);
    if (!sla) return null;

    const Icon = sla.icon;

    return (
        <span className={`sla-badge ${sla.className}`} title={`Resolution SLA: ${sla.label}`}>
            <Icon size={12} className="sla-icon" />
            <span>{sla.label}</span>
        </span>
    );
}
