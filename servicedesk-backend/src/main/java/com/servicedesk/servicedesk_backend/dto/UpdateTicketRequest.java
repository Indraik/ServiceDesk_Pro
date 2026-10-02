package com.servicedesk.servicedesk_backend.dto;

import com.servicedesk.servicedesk_backend.entity.Category;
import com.servicedesk.servicedesk_backend.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateTicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Category is required")
    private Category category;

    public UpdateTicketRequest() {
    }

    public UpdateTicketRequest(
            String title,
            String description,
            Priority priority,
            Category category) {

        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}