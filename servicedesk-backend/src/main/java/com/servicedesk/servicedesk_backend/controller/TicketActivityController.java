package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.ActivityResponse;
import com.servicedesk.servicedesk_backend.service.TicketActivityService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketActivityController {

    private final TicketActivityService ticketActivityService;

    public TicketActivityController(
            TicketActivityService ticketActivityService) {

        this.ticketActivityService = ticketActivityService;
    }

    @GetMapping("/{ticketId}/activity")
    public List<ActivityResponse> getActivity(
            @PathVariable Long ticketId,
            Authentication authentication) {

        String email = authentication.getName();

        return ticketActivityService.getActivity(
                ticketId,
                email
        );
    }
}