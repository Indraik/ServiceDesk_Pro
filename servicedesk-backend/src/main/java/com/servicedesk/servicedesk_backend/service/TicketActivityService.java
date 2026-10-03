package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.ActivityResponse;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TicketActivityService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketStatusHistoryRepository statusHistoryRepository;
    private final TicketAssignmentHistoryRepository assignmentHistoryRepository;
    private final CommentRepository commentRepository;

    public TicketActivityService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketStatusHistoryRepository statusHistoryRepository,
            TicketAssignmentHistoryRepository assignmentHistoryRepository,
            CommentRepository commentRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.assignmentHistoryRepository = assignmentHistoryRepository;
        this.commentRepository = commentRepository;
    }
    
    public List<ActivityResponse> getActivity(
            Long ticketId,
            String email) {

        Ticket ticket = getAccessibleTicket(ticketId, email);

        List<ActivityResponse> activities = new ArrayList<>();

        // Status history
        statusHistoryRepository
                .findByTicketIdOrderByChangedAtAsc(ticketId)
                .forEach(history -> {

                    String message =
                            "Ticket status changed from "
                                    + history.getFromStatus()
                                    + " to "
                                    + history.getToStatus();

                    activities.add(
                            new ActivityResponse(
                                    "STATUS_CHANGE",
                                    message,
                                    history.getChangedBy().getName(),
                                    history.getChangedAt()
                            )
                    );
                });

        // Assignment history
        assignmentHistoryRepository
                .findByTicketIdOrderByAssignedAtAsc(ticketId)
                .forEach(history -> {

                    String message =
                            "Ticket assigned to "
                                    + history.getAssignedTo().getName();

                    activities.add(
                            new ActivityResponse(
                                    "ASSIGNMENT",
                                    message,
                                    history.getAssignedBy().getName(),
                                    history.getAssignedAt()
                            )
                    );
                });

        // Comments
        commentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId)
                .forEach(comment -> {

                    activities.add(
                            new ActivityResponse(
                                    "COMMENT",
                                    comment.getContent(),
                                    comment.getCreatedBy().getName(),
                                    comment.getCreatedAt()
                            )
                    );
                });

        activities.sort(
                Comparator.comparing(ActivityResponse::getTimestamp)
        );

        return activities;
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
                    "You are not allowed to view this ticket activity");
        }

        return ticket;
    }
}
