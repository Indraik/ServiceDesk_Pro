package com.servicedesk.servicedesk_backend.controller;

import com.servicedesk.servicedesk_backend.dto.CommentResponse;
import com.servicedesk.servicedesk_backend.dto.CreateCommentRequest;
import com.servicedesk.servicedesk_backend.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return commentService.addComment(
                ticketId,
                request,
                email
        );
    }

    @GetMapping
    public List<CommentResponse> getComments(
            @PathVariable Long ticketId,
            Authentication authentication) {

        String email = authentication.getName();

        return commentService.getComments(
                ticketId,
                email
        );
    }
}