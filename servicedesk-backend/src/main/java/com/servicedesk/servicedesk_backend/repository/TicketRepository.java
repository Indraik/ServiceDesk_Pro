package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.Ticket;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findByCreatedByEmail(String email, Pageable pageable);
    Optional<Ticket> findByIdAndCreatedByEmail(Long id, String email);

}
