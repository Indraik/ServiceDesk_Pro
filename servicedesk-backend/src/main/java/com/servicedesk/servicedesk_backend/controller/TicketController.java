package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.*;
import com.servicedesk.servicedesk_backend.entity.Category;
import com.servicedesk.servicedesk_backend.entity.Priority;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.TicketStatus;
import com.servicedesk.servicedesk_backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService){
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {
        String email = authentication.getName();

        return ticketService.createTicket(request,email);
    }

    @GetMapping
    public Page<TicketResponse> getMyTickets(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Category category,
            Pageable pageable) {

        String email = authentication.getName();

        return ticketService.getMyTickets(
                email,
                search,
                status,
                priority,
                category,
                pageable
        );
    }

    @GetMapping("/{id}")
    public TicketResponse getTicket(
            @PathVariable Long id,
            Authentication authentication){

        String email = authentication.getName();

        return ticketService.getTicketById(id, email);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketResponse assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            Authentication authentication) {

        String adminEmail = authentication.getName();

        return ticketService.assignTicket(
                id,
                request.getAgentId(),
                adminEmail
        );
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT','CUSTOMER')")
    public TicketResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication){
        String email = authentication.getName();

        return ticketService.updateStatus(
                id,
                request.getStatus(),
                email
        );
    }

    @PutMapping("/{ticketId}")
    public TicketResponse updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ticketService.updateTicket(
                ticketId,
                request,
                email
        );
    }
}
