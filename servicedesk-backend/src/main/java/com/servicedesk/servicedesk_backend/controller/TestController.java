package com.servicedesk.servicedesk_backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public String protectedEndPoint(){
        return "You accessed a protected Endpoint!";
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public String customerEndPoint(){
        return "Customer access granted!";
    }

    @GetMapping("/agent")
    @PreAuthorize("hasRole('AGENT')")
    public String agentEndPoint(){
        return "Agent access granted!";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminEndPoint(){
        return "Admin access granted!";
    }

}
