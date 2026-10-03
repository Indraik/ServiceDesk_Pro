package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.AssignmentHistoryResponse;
import com.servicedesk.servicedesk_backend.dto.StatusHistoryResponse;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.TicketAssignmentHistory;
import com.servicedesk.servicedesk_backend.entity.TicketStatusHistory;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.TicketAssignmentHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.TicketStatusHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketHistoryService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketStatusHistoryRepository statusHistoryRepository;
    private final TicketAssignmentHistoryRepository assignmentHistoryRepository;

    public TicketHistoryService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketStatusHistoryRepository statusHistoryRepository,
            TicketAssignmentHistoryRepository assignmentHistoryRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.assignmentHistoryRepository = assignmentHistoryRepository;
    }

    public List<StatusHistoryResponse> getStatusHistory(
            Long ticketId,
            String email) {

        Ticket ticket = getAccessibleTicket(ticketId, email);

        return statusHistoryRepository
                .findByTicketIdOrderByChangedAtAsc(ticket.getId())
                .stream()
                .map(this::toStatusHistoryResponse)
                .toList();
    }

    public List<AssignmentHistoryResponse> getAssignmentHistory(
            Long ticketId,
            String email) {

        Ticket ticket = getAccessibleTicket(ticketId, email);

        return assignmentHistoryRepository
                .findByTicketIdOrderByAssignedAtAsc(ticket.getId())
                .stream()
                .map(this::toAssignmentHistoryResponse)
                .toList();
    }

    private Ticket getAccessibleTicket(
            Long ticketId,
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

        boolean isAssignedAgent =
                ticket.getAssignedTo() != null &&
                        ticket.getAssignedTo().getId().equals(user.getId());

        if (!isAdmin && !isOwner && !isAssignedAgent) {
            throw new AccessDeniedException(
                    "You are not allowed to view this ticket history");
        }

        return ticket;
    }

    private StatusHistoryResponse toStatusHistoryResponse(
            TicketStatusHistory history) {

        User changedBy = history.getChangedBy();

        return new StatusHistoryResponse(
                history.getId(),
                history.getFromStatus(),
                history.getToStatus(),
                changedBy.getId(),
                changedBy.getName(),
                history.getChangedAt()
        );
    }

    private AssignmentHistoryResponse toAssignmentHistoryResponse(
            TicketAssignmentHistory history) {

        User assignedTo = history.getAssignedTo();
        User assignedBy = history.getAssignedBy();

        return new AssignmentHistoryResponse(
                history.getId(),
                assignedTo.getId(),
                assignedTo.getName(),
                assignedBy.getId(),
                assignedBy.getName(),
                history.getAssignedAt()
        );
    }
}