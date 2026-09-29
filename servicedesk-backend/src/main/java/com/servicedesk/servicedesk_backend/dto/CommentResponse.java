package com.servicedesk.servicedesk_backend.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public CommentResponse(
            Long id,
            String content,
            Long createdById,
            String createdByName,
            LocalDateTime createdAt) {

        this.id = id;
        this.content = content;
        this.createdById = createdById;
        this.createdByName = createdByName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}