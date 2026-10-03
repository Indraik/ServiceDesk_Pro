package com.servicedesk.servicedesk_backend.dto;

import com.servicedesk.servicedesk_backend.entity.TicketStatus;

import java.time.LocalDateTime;

public class StatusHistoryResponse {

    private Long id;
    private TicketStatus fromStatus;
    private TicketStatus toStatus;
    private Long changedById;
    private String changedByName;
    private LocalDateTime changedAt;

    public StatusHistoryResponse(
            Long id,
            TicketStatus fromStatus,
            TicketStatus toStatus,
            Long changedById,
            String changedByName,
            LocalDateTime changedAt) {

        this.id = id;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedById = changedById;
        this.changedByName = changedByName;
        this.changedAt = changedAt;
    }

    public Long getId() {
        return id;
    }

    public TicketStatus getFromStatus() {
        return fromStatus;
    }

    public TicketStatus getToStatus() {
        return toStatus;
    }

    public Long getChangedById() {
        return changedById;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }
}