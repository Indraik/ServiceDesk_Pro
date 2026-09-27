package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.CreateTicketRequest;
import com.servicedesk.servicedesk_backend.dto.TicketResponse;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.TicketStatus;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public TicketResponse createTicket(
            CreateTicketRequest request,
            String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Ticket ticket = new Ticket();

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(user);
        ticket.setAssignedTo(null);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);

        return toTicketResponse(savedTicket);
    }

    private TicketResponse toTicketResponse(Ticket ticket){

        Long assignedToId = null;
        String assignedToName = null;

        if(ticket.getAssignedTo() != null){
            assignedToId = ticket.getAssignedTo().getId();
            assignedToName = ticket.getAssignedTo().getName();
        }

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCreatedBy().getId(),
                ticket.getCreatedBy().getName(),
                assignedToId,
                assignedToName,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }

    public List<TicketResponse> getMyTickets(String email){
        List<Ticket> tickets = ticketRepository.findByCreatedByEmail(email);

        return tickets.stream()
                .map(this::toTicketResponse)
                .toList();
    }

    public TicketResponse getMyTicket(
            Long ticketId,
            String email){
        Ticket ticket = ticketRepository
                .findByIdAndCreatedByEmail(ticketId, email)
                .orElseThrow(()->
                        new ResourceNotFoundException("Ticket not found"));

        return toTicketResponse(ticket);
    }
}
