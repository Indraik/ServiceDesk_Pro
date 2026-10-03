package com.servicedesk.servicedesk_backend.dto;

import java.time.LocalDateTime;

public class ActivityResponse {

    private String type;
    private String message;
    private String performedBy;
    private LocalDateTime timestamp;

    public ActivityResponse(
            String type,
            String message,
            String performedBy,
            LocalDateTime timestamp) {

        this.type = type;
        this.message = message;
        this.performedBy = performedBy;
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}