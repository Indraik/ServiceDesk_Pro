package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.RegisterRequest;
import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.entity.Role;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.EmailAlreadyExistsException;
import com.servicedesk.servicedesk_backend.repository.RoleRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import com.servicedesk.servicedesk_backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private RoleRepository roleRepository;
    private JwtService jwtService;
    private AuthService authService;

    private Role customerRole;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        roleRepository = mock(RoleRepository.class);
        jwtService = mock(JwtService.class);

        authService = new AuthService(userRepository, passwordEncoder, roleRepository, jwtService);

        customerRole = new Role("CUSTOMER");
        when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword123");
    }

    @Test
    void register_alwaysAssignsCustomerRoleByDefault() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "Password123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return u;
        });

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("CUSTOMER", response.getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("CUSTOMER", userCaptor.getValue().getRole().getName());
    }

    @Test
    void register_safelyIgnoresClientAttemptToAssignPrivilegedRole() {
        RegisterRequest request = new RegisterRequest("Hacker", "hacker@example.com", "Password123");
        request.setRole("ADMIN"); // Attempting privilege escalation

        when(userRepository.existsByEmail("hacker@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("CUSTOMER", response.getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("CUSTOMER", userCaptor.getValue().getRole().getName());
    }

    @Test
    void register_throwsEmailAlreadyExistsWhenEmailTaken() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "existing@example.com", "Password123");
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
