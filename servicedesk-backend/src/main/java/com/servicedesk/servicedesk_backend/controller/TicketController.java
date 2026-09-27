package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.CreateTicketRequest;
import com.servicedesk.servicedesk_backend.dto.TicketResponse;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public List<TicketResponse> getMyTickets(Authentication authentication){
        String email = authentication.getName();

        return ticketService.getMyTickets(email);
    }

    @GetMapping("/{id}")
    public TicketResponse getMyTicket(
            @PathVariable Long id,
            Authentication authentication){
        String email = authentication.getName();

        return ticketService.getMyTicket(id, email);
    }
}
