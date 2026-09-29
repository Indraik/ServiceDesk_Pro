package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
