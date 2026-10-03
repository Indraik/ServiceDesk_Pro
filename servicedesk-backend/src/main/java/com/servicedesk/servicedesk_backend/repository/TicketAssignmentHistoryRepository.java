package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.TicketAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAssignmentHistoryRepository
        extends JpaRepository<TicketAssignmentHistory, Long> {

    List<TicketAssignmentHistory> findByTicketIdOrderByAssignedAtAsc(Long ticketId);
}