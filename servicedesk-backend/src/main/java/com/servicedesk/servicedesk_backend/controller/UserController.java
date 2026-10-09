
package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.AgentResponse;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.repository.UserRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AgentResponse> getAgents() {

        List<User> agents =
                userRepository.findAllByRole_Name("AGENT");

        return agents.stream()
                .map(AgentResponse::from)
                .toList();
    }
}
