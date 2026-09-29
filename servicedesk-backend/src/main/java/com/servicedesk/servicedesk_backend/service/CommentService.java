package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.CommentResponse;
import com.servicedesk.servicedesk_backend.dto.CreateCommentRequest;
import com.servicedesk.servicedesk_backend.entity.Comment;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.CommentRepository;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(
            Long ticketId,
            CreateCommentRequest request,
            String email) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!canAccessTicket(ticket, user)) {
            throw new AccessDeniedException(
                    "You do not have access to this ticket");
        }

        Comment comment = new Comment();

        comment.setTicket(ticket);
        comment.setContent(request.getContent());
        comment.setCreatedBy(user);
        comment.setCreatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);

        return toCommentResponse(savedComment);
    }

    public List<CommentResponse> getComments(
            Long ticketId,
            String email) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!canAccessTicket(ticket, user)) {
            throw new AccessDeniedException(
                    "You do not have access to this ticket");
        }

        return commentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    private boolean canAccessTicket(
            Ticket ticket,
            User user) {

        String role = user.getRole().getName();

        if ("ADMIN".equals(role)) {
            return true;
        }

        if ("CUSTOMER".equals(role)) {
            return ticket.getCreatedBy()
                    .getId()
                    .equals(user.getId());
        }

        if ("AGENT".equals(role)) {
            return ticket.getAssignedTo() != null
                    && ticket.getAssignedTo()
                    .getId()
                    .equals(user.getId());
        }

        return false;
    }

    private CommentResponse toCommentResponse(Comment comment) {

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedBy().getId(),
                comment.getCreatedBy().getName(),
                comment.getCreatedAt()
        );
    }
}