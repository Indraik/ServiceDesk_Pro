package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.Priority;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.TicketStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByCreatedByEmail(String email, Pageable pageable);
    Optional<Ticket> findByIdAndCreatedByEmail(Long id, String email);
    Page<Ticket> findByCreatedByEmailAndStatus(
            String email,
            TicketStatus status,
            Pageable pageable);

    Page<Ticket> findByCreatedByEmailAndPriority(
            String email,
            Priority priority,
            Pageable pageable);

    Page<Ticket> findByCreatedByEmailAndStatusAndPriority(
            String email,
            TicketStatus status,
            Priority priority,
            Pageable pageable);


}
