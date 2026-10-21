package com.servicedesk.servicedesk_backend.dto;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;

    public UserResponse(
            Long id,
            String name,
            String email,
            String role) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public static UserResponse from(com.servicedesk.servicedesk_backend.entity.User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : null
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}