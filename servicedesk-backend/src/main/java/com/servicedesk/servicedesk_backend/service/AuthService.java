package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.RegisterRequest;
import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.EmailAlreadyExistsException;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public UserResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new EmailAlreadyExistsException("Email Already Registered");
        }
        String HashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(
                request.getName(),
                request.getEmail(),
                HashedPassword
        );
        User savedUser = userRepository.save(user);
        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );

    }
}
