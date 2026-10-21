
package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.AgentResponse;
import com.servicedesk.servicedesk_backend.dto.UpdateUserRoleRequest;
import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import com.servicedesk.servicedesk_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return userService.updateUserRole(id, request.getRole(), adminEmail);
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
