package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.ProjectInfoResponse;
import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import com.servicedesk.servicedesk_backend.entity.User;
import org.springframework.stereotype.Service;

@Service
public class ProjectInfoService {
    private final UserRepository userRepository;
    public ProjectInfoService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public UserResponse createTestUser(){
        User user = new User(
                "Test User",
                "test2@servicedesk.com",
                "test@123"
        );
        User Saveduser = userRepository.save(user);
        return new UserResponse(
                Saveduser.getId(),
                Saveduser.getName(),
                Saveduser.getEmail()
        );
    }
    public ProjectInfoResponse getProjectInfo(){
        return new ProjectInfoResponse(
                "ServiceDesk Pro",
                "1.0",
                "Enterprise Service Platform"
        );
    }
}
