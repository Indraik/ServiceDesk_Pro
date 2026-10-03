package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.AssignmentHistoryResponse;
import com.servicedesk.servicedesk_backend.dto.StatusHistoryResponse;
import com.servicedesk.servicedesk_backend.service.TicketHistoryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketHistoryController {

    private final TicketHistoryService ticketHistoryService;

    public TicketHistoryController(
            TicketHistoryService ticketHistoryService) {

        this.ticketHistoryService = ticketHistoryService;
    }

    @GetMapping("/{ticketId}/history/status")
    public List<StatusHistoryResponse> getStatusHistory(
            @PathVariable Long ticketId,
            Authentication authentication) {

        String email = authentication.getName();

        return ticketHistoryService.getStatusHistory(
                ticketId,
                email
        );
    }

    @GetMapping("/{ticketId}/history/assignments")
    public List<AssignmentHistoryResponse> getAssignmentHistory(
            @PathVariable Long ticketId,
            Authentication authentication) {

        String email = authentication.getName();

        return ticketHistoryService.getAssignmentHistory(
                ticketId,
                email
        );
    }
}