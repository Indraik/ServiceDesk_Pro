package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.entity.Role;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.RoleRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private UserService userService;

    private Role customerRole;
    private Role agentRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        userService = new UserService(userRepository, roleRepository);

        customerRole = new Role("CUSTOMER");
        agentRole = new Role("AGENT");
        adminRole = new Role("ADMIN");

        when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(roleRepository.findByName("AGENT")).thenReturn(Optional.of(agentRole));
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
    }

    @Test
    void getAllUsers_returnsAllUsersMappedToUserResponse() {
        User u1 = new User("Alice", "alice@example.com", "hash1");
        u1.setRole(customerRole);
        User u2 = new User("Bob", "bob@example.com", "hash2");
        u2.setRole(agentRole);

        when(userRepository.findAllByOrderByIdAsc()).thenReturn(List.of(u1, u2));

        List<UserResponse> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertEquals("Alice", result.get(0).getName());
        assertEquals("CUSTOMER", result.get(0).getRole());
        assertEquals("Bob", result.get(1).getName());
        assertEquals("AGENT", result.get(1).getRole());
    }

    @Test
    void updateUserRole_successfullyPromotesCustomerToAgent() {
        User target = new User("Alice", "alice@example.com", "hash1");
        target.setRole(customerRole);

        when(userRepository.findById(10L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUserRole(10L, "AGENT", "admin@example.com");

        assertNotNull(response);
        assertEquals("AGENT", response.getRole());
        assertEquals("AGENT", target.getRole().getName());
        verify(userRepository).save(target);
    }

    @Test
    void updateUserRole_preventsSelfRoleChange() {
        User admin = new User("Super Admin", "admin@example.com", "hash1");
        admin.setRole(adminRole);

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                userService.updateUserRole(1L, "AGENT", "admin@example.com")
        );

        assertTrue(ex.getMessage().contains("cannot modify your own role"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserRole_preventsDemotingTheLastAdmin() {
        User targetAdmin = new User("Admin Two", "admin2@example.com", "hash2");
        targetAdmin.setRole(adminRole);

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.countByRole_Name("ADMIN")).thenReturn(1L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                userService.updateUserRole(2L, "CUSTOMER", "admin1@example.com")
        );

        assertTrue(ex.getMessage().contains("At least one administrator is required"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserRole_allowsDemotingAdminIfOtherAdminsExist() {
        User targetAdmin = new User("Admin Two", "admin2@example.com", "hash2");
        targetAdmin.setRole(adminRole);

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.countByRole_Name("ADMIN")).thenReturn(2L);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUserRole(2L, "AGENT", "admin1@example.com");

        assertNotNull(response);
        assertEquals("AGENT", response.getRole());
        verify(userRepository).save(targetAdmin);
    }

    @Test
    void updateUserRole_throwsNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.updateUserRole(999L, "ADMIN", "admin@example.com")
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserRole_throwsIllegalArgumentForInvalidRole() {
        User user = new User("Alice", "alice@example.com", "hash");
        user.setRole(customerRole);

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(roleRepository.findByName("SUPER_USER")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                userService.updateUserRole(5L, "SUPER_USER", "admin@example.com")
        );

        verify(userRepository, never()).save(any(User.class));
    }
}
