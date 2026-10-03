package com.servicedesk.servicedesk_backend.dto;

import java.time.LocalDateTime;

public class AssignmentHistoryResponse {

    private Long id;

    private Long assignedToId;
    private String assignedToName;

    private Long assignedById;
    private String assignedByName;

    private LocalDateTime assignedAt;

    public AssignmentHistoryResponse(
            Long id,
            Long assignedToId,
            String assignedToName,
            Long assignedById,
            String assignedByName,
            LocalDateTime assignedAt) {

        this.id = id;
        this.assignedToId = assignedToId;
        this.assignedToName = assignedToName;
        this.assignedById = assignedById;
        this.assignedByName = assignedByName;
        this.assignedAt = assignedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public Long getAssignedById() {
        return assignedById;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
}