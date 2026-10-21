package com.servicedesk.servicedesk_backend.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private Long createdById;
    private String createdByName;
    private String createdByRole;
    private LocalDateTime createdAt;

    public CommentResponse(
            Long id,
            String content,
            Long createdById,
            String createdByName,
            String createdByRole,
            LocalDateTime createdAt) {

        this.id = id;
        this.content = content;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.createdByRole = createdByRole;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public String getCreatedByRole() {
        return createdByRole;
    }

    // Aliases for seamless frontend JSON serialization
    public String getAuthorName() {
        return createdByName;
    }

    public String getAuthorRole() {
        return createdByRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}