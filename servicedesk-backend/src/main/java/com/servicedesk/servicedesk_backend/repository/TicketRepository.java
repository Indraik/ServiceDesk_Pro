package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByEmail(String email);
    Optional<Ticket> findByIdAndCreatedByEmail(Long id, String email);
}
