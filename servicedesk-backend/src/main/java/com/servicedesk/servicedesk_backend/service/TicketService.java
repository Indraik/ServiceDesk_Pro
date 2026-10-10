package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.CreateTicketRequest;
import com.servicedesk.servicedesk_backend.dto.TicketResponse;
import com.servicedesk.servicedesk_backend.dto.UpdateTicketRequest;
import com.servicedesk.servicedesk_backend.entity.*;
import com.servicedesk.servicedesk_backend.exception.InvalidTicketStatusException;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.exception.TicketConflictException;
import com.servicedesk.servicedesk_backend.repository.TicketAssignmentHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.TicketStatusHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import com.servicedesk.servicedesk_backend.specification.TicketSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import com.servicedesk.servicedesk_backend.entity.Category;
import org.springframework.transaction.annotation.Transactional;

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
        ticket.setCategory(request.getCategory());
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
                ticket.getCategory(),
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
            Category category,
            Pageable pageable) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String role = user.getRole().getName();

        Specification<Ticket> specification;

        if("ADMIN".equals(role)){

            specification = TicketSpecification.filterAdminTickets(
                    search,
                    status,
                    priority,
                    category
            );

        } else if ("AGENT".equals(role)) {

            specification = TicketSpecification.filterAgentTickets(
                    email,
                    search,
                    status,
                    priority,
                    category
            );

        } else {

            specification = TicketSpecification.filterTickets(
                    email,
                    search,
                    status,
                    priority,
                    category
            );
        }

        Page<Ticket> tickets =
                ticketRepository.findAll(
                        specification,
                        pageable
                );

        return tickets.map(this::toTicketResponse);
    }

    public TicketResponse getTicketById(
            Long ticketId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String role = user.getRole().getName();

        Specification<Ticket> specification =
                TicketSpecification.ticketAccessibleBy(
                        email,
                        role
                );

        Specification<Ticket> ticketSpecification =
                specification.and(
                        (root, query, criteriaBuilder) ->
                                criteriaBuilder.equal(
                                        root.get("id"),
                                        ticketId
                                )
                );

        Ticket ticket = ticketRepository
                .findOne(ticketSpecification)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found"
                        ));

        return toTicketResponse(ticket);
    }

    @Transactional
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
            throw new TicketConflictException("Only OPEN tickets can be assigned");

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

    @Transactional
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

    public TicketResponse updateTicket(
            Long ticketId,
            UpdateTicketRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        boolean isAdmin =
                user.getRole().getName().equals("ADMIN");

        boolean isOwner =
                ticket.getCreatedBy().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "You are not allowed to update this ticket");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED ||
                ticket.getStatus() == TicketStatus.CANCELLED) {

            throw new InvalidTicketStatusException(
                    "Closed or cancelled tickets cannot be updated");
        }

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCategory(request.getCategory());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updatedTicket = ticketRepository.save(ticket);

        return toTicketResponse(updatedTicket);
    }
}
