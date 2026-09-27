package com.servicedesk.servicedesk_backend.dto;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {

    @NotNull(message = "Agent ID is required")
    private Long agentId;

    public AssignTicketRequest(){}

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
}
