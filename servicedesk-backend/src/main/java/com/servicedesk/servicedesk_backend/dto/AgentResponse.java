
package com.servicedesk.servicedesk_backend.dto;

import com.servicedesk.servicedesk_backend.entity.User;

public class AgentResponse {

    private Long id;
    private String name;
    private String email;

    public AgentResponse(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public static AgentResponse from(User user) {
        return new AgentResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
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
}
