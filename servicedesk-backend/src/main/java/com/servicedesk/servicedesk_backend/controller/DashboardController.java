package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.DashboardResponse;
import com.servicedesk.servicedesk_backend.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService ){
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(Authentication authentication){

        String email = authentication.getName();

        return dashboardService.getDashboard(email);
    }
}
