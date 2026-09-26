package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.LoginRequest;
import com.servicedesk.servicedesk_backend.dto.RegisterRequest;
import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    public User login(@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }
}
