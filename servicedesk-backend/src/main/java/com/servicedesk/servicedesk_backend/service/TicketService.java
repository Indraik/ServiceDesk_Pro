package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.CreateTicketRequest;
import com.servicedesk.servicedesk_backend.dto.TicketResponse;
import com.servicedesk.servicedesk_backend.entity.*;
import com.servicedesk.servicedesk_backend.exception.InvalidTicketStatusException;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.TicketAssignmentHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.TicketStatusHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketStatusHistoryRepository ticketStatusHistoryRepository;
    private final TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketStatusHistoryRepository ticketStatusHistoryRepository,
            TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketStatusHistoryRepository = ticketStatusHistoryRepository;
        this.ticketAssignmentHistoryRepository = ticketAssignmentHistoryRepository;
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
    
    public Page<TicketResponse> getMyTickets(
            String email,
            String search,
            TicketStatus status,
            Priority priority,
            Pageable pageable) {

        Page<Ticket> tickets;

        if (search != null && !search.isBlank()
                && status != null
                && priority != null) {

            tickets = ticketRepository
                    .findByCreatedByEmailAndStatusAndPriorityAndTitleContainingIgnoreCaseOrCreatedByEmailAndStatusAndPriorityAndDescriptionContainingIgnoreCase(
                            email,
                            status,
                            priority,
                            search,
                            email,
                            status,
                            priority,
                            search,
                            pageable
                    );

        } else if (search != null && !search.isBlank()) {

            tickets = ticketRepository
                    .findByCreatedByEmailAndTitleContainingIgnoreCaseOrCreatedByEmailAndDescriptionContainingIgnoreCase(
                            email,
                            search,
                            email,
                            search,
                            pageable
                    );

        } else if (status != null && priority != null) {

            tickets = ticketRepository
                    .findByCreatedByEmailAndStatusAndPriority(
                            email,
                            status,
                            priority,
                            pageable
                    );

        } else if (status != null) {

            tickets = ticketRepository
                    .findByCreatedByEmailAndStatus(
                            email,
                            status,
                            pageable
                    );

        } else if (priority != null) {

            tickets = ticketRepository
                    .findByCreatedByEmailAndPriority(
                            email,
                            priority,
                            pageable
                    );

        } else {

            tickets = ticketRepository
                    .findByCreatedByEmail(
                            email,
                            pageable
                    );
        }

        return tickets.map(this::toTicketResponse);
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

    public TicketResponse assignTicket(
            Long ticketId,
            Long agentId,
            String adminEmail){

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Admin not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Ticket not found"));

        User agent = userRepository.findByIdAndRoleName(agentId,"AGENT")
                .orElseThrow(()->
                        new ResourceNotFoundException("Agent not found"));

        if(ticket.getStatus() != TicketStatus.OPEN){
            throw new IllegalStateException("Only OPEN tickets can be assigned");

        }

        ticket.setAssignedTo(agent);
        ticket.setStatus(TicketStatus.ASSIGNED);
        ticket.setUpdatedAt(LocalDateTime.now());

        TicketAssignmentHistory history =
                new TicketAssignmentHistory();

        history.setTicket(ticket);
        history.setAssignedTo(agent);
        history.setAssignedBy(admin);
        history.setAssignedAt(LocalDateTime.now());

        ticketAssignmentHistoryRepository.save(history);

        Ticket savedTicket = ticketRepository.save(ticket);

        return toTicketResponse(savedTicket);
    }

    public TicketResponse updateStatus(
            Long ticketId,
            TicketStatus newStatus,
            String email) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        TicketStatus currentStatus = ticket.getStatus();

        boolean isAssignedAgent =
                ticket.getAssignedTo() != null &&
                        ticket.getAssignedTo().getEmail().equals(email);

        boolean isTicketOwner =
                ticket.getCreatedBy().getEmail().equals(email);

        if (currentStatus == TicketStatus.ASSIGNED
                && newStatus == TicketStatus.IN_PROGRESS) {

            if (!isAssignedAgent) {
                throw new AccessDeniedException(
                        "Only the assigned agent can start this ticket");
            }

        } else if (currentStatus == TicketStatus.IN_PROGRESS
                && newStatus == TicketStatus.RESOLVED) {

            if (!isAssignedAgent) {
                throw new AccessDeniedException(
                        "Only the assigned agent can resolve this ticket");
            }

        } else if (currentStatus == TicketStatus.RESOLVED
                && newStatus == TicketStatus.CLOSED) {

            if (!isTicketOwner) {
                throw new AccessDeniedException(
                        "Only the ticket owner can close this ticket");
            }

        } else {

            throw new InvalidTicketStatusException(
                    "Invalid ticket status transition");
        }

        TicketStatus oldStatus = ticket.getStatus();

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        TicketStatusHistory history = new TicketStatusHistory();

        history.setTicket(ticket);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setChangedBy(
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("User not found"))
        );
        history.setChangedAt(LocalDateTime.now());

        ticketStatusHistoryRepository.save(history);

        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);

        return toTicketResponse(savedTicket);
    }
}
