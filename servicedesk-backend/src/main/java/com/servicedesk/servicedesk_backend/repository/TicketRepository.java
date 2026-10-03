package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.Category;
import com.servicedesk.servicedesk_backend.entity.Priority;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    long countByStatus(TicketStatus status);

    long countByCreatedByEmail(String email);

    long countByCreatedByEmailAndStatus(
            String email,
            TicketStatus status);

    long countByAssignedToEmail(String email);

    long countByAssignedToEmailAndStatus(
            String email,
            TicketStatus status);

    long countByCategory(Category category);

    long countByPriority(Priority priority);

    long countByCreatedByEmailAndCategory(
            String email,
            Category category);

    long countByCreatedByEmailAndPriority(
            String email,
            Priority priority);

    long countByAssignedToEmailAndCategory(
            String email,
            Category category);

    long countByAssignedToEmailAndPriority(
            String email,
            Priority priority);
}
