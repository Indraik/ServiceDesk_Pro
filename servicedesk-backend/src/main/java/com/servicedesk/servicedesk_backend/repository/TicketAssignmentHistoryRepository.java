package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.TicketAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketAssignmentHistoryRepository
        extends JpaRepository<TicketAssignmentHistory, Long> {
}