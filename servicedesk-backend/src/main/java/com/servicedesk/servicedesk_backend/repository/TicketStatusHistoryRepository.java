package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.TicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {
}
