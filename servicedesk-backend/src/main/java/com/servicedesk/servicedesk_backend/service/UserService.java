package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.entity.Role;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.RoleRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByIdAsc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, String newRoleName, String currentAdminEmail) {
        if (newRoleName == null || newRoleName.trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required");
        }

        String targetRole = newRoleName.trim().toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Self-role change protection
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new IllegalArgumentException("You cannot modify your own role");
        }

        // Validate target role exists
        Role role = roleRepository.findByName(targetRole)
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + newRoleName));

        String oldRoleName = user.getRole() != null ? user.getRole().getName() : "NONE";

        // If the role is unchanged, return current state
        if (oldRoleName.equalsIgnoreCase(targetRole)) {
            return UserResponse.from(user);
        }

        // Protect last administrator from demotion
        if ("ADMIN".equalsIgnoreCase(oldRoleName) && !"ADMIN".equalsIgnoreCase(targetRole)) {
            long adminCount = userRepository.countByRole_Name("ADMIN");
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot change role. At least one administrator is required.");
            }
        }

        user.setRole(role);
        User savedUser = userRepository.save(user);

        // Security Audit Log
        log.info("[AUDIT] User role updated successfully: targetUserId={}, targetEmail={}, previousRole={}, newRole={}, executedByAdmin={}",
                savedUser.getId(), savedUser.getEmail(), oldRoleName, targetRole, currentAdminEmail);

        return UserResponse.from(savedUser);
    }
}
