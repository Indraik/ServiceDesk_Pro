package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.ProjectInfoResponse;
import com.servicedesk.servicedesk_backend.dto.UserResponse;
import com.servicedesk.servicedesk_backend.service.ProjectInfoService;
import com.servicedesk.servicedesk_backend.entity.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    private ProjectInfoService projectInfoService;
    public HelloController(ProjectInfoService projectInfoService){
        this.projectInfoService = projectInfoService;
    }
    @GetMapping("/api/home")
    public String hello(){
        return "Hi this is API Home!!";
    }
    @GetMapping("/api/info")
    public ProjectInfoResponse info(){
        return projectInfoService.getProjectInfo();
    }
    @PostMapping("/api/test-user")
    public UserResponse createTestUser(){
        return projectInfoService.createTestUser();
    }


}
