package com.servicedesk.servicedesk_backend.dto;

import java.util.Map;

public class DashboardResponse {

    private long totalTickets;
    private long openTickets;
    private long assignedTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long cancelledTickets;

    private Map<String, Long> categoryCounts;
    private Map<String, Long> priorityCounts;

    public DashboardResponse(
            long totalTickets,
            long openTickets,
            long assignedTickets,
            long inProgressTickets,
            long resolvedTickets,
            long closedTickets,
            long cancelledTickets,
            Map<String, Long> categoryCounts,
            Map<String, Long> priorityCounts) {

        this.totalTickets = totalTickets;
        this.openTickets = openTickets;
        this.assignedTickets = assignedTickets;
        this.inProgressTickets = inProgressTickets;
        this.resolvedTickets = resolvedTickets;
        this.closedTickets = closedTickets;
        this.cancelledTickets = cancelledTickets;
        this.categoryCounts = categoryCounts;
        this.priorityCounts = priorityCounts;
    }

    public long getTotalTickets() {
        return totalTickets;
    }

    public long getOpenTickets() {
        return openTickets;
    }

    public long getAssignedTickets() {
        return assignedTickets;
    }

    public long getInProgressTickets() {
        return inProgressTickets;
    }

    public long getResolvedTickets() {
        return resolvedTickets;
    }

    public long getClosedTickets() {
        return closedTickets;
    }

    public long getCancelledTickets() {
        return cancelledTickets;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public Map<String, Long> getPriorityCounts() {
        return priorityCounts;
    }
}