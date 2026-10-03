package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.dto.DashboardResponse;
import com.servicedesk.servicedesk_backend.entity.Category;
import com.servicedesk.servicedesk_backend.entity.Priority;
import com.servicedesk.servicedesk_backend.entity.TicketStatus;
import com.servicedesk.servicedesk_backend.entity.User;
import com.servicedesk.servicedesk_backend.exception.ResourceNotFoundException;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardService(
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String role = user.getRole().getName();

        long totalTickets;
        long openTickets;
        long assignedTickets;
        long inProgressTickets;
        long resolvedTickets;
        long closedTickets;
        long cancelledTickets;

        Map<String, Long> categoryCounts = new LinkedHashMap<>();
        Map<String, Long> priorityCounts = new LinkedHashMap<>();

        if (role.equals("ADMIN")) {

            totalTickets = ticketRepository.count();

            openTickets = ticketRepository.countByStatus(TicketStatus.OPEN);

            assignedTickets = ticketRepository.countByStatus(TicketStatus.ASSIGNED);

            inProgressTickets = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);

            resolvedTickets = ticketRepository.countByStatus(TicketStatus.RESOLVED);

            closedTickets = ticketRepository.countByStatus(TicketStatus.CLOSED);

            cancelledTickets = ticketRepository.countByStatus(TicketStatus.CANCELLED);

            for (Category category : Category.values()) {
                categoryCounts.put(
                        category.name(),
                        ticketRepository.countByCategory(category)
                );
            }

            for (Priority priority : Priority.values()) {
                priorityCounts.put(
                        priority.name(),
                        ticketRepository.countByPriority(priority)
                );
            }

        } else if (role.equals("AGENT")) {

            totalTickets = ticketRepository.countByAssignedToEmail(email);

            openTickets = 0;

            assignedTickets = ticketRepository.countByAssignedToEmailAndStatus(
                            email, TicketStatus.ASSIGNED);

            inProgressTickets = ticketRepository.countByAssignedToEmailAndStatus(
                            email, TicketStatus.IN_PROGRESS);

            resolvedTickets = ticketRepository.countByAssignedToEmailAndStatus(
                            email, TicketStatus.RESOLVED);

            closedTickets = ticketRepository.countByAssignedToEmailAndStatus(
                            email, TicketStatus.CLOSED);

            cancelledTickets = ticketRepository.countByAssignedToEmailAndStatus(
                            email, TicketStatus.CANCELLED);

            for (Category category : Category.values()) {
                categoryCounts.put(
                        category.name(),
                        ticketRepository.countByAssignedToEmailAndCategory(
                                email,
                                category
                        )
                );
            }

            for (Priority priority : Priority.values()) {
                priorityCounts.put(
                        priority.name(),
                        ticketRepository.countByAssignedToEmailAndPriority(
                                email,
                                priority
                        )
                );
            }

        } else {

            totalTickets = ticketRepository.countByCreatedByEmail(email);

            openTickets = ticketRepository.countByCreatedByEmailAndStatus(
                            email, TicketStatus.OPEN);

            assignedTickets = ticketRepository.countByCreatedByEmailAndStatus(
                            email, TicketStatus.ASSIGNED);

            inProgressTickets =ticketRepository.countByCreatedByEmailAndStatus(
                            email, TicketStatus.IN_PROGRESS);

            resolvedTickets = ticketRepository.countByCreatedByEmailAndStatus(
                            email, TicketStatus.RESOLVED);

            closedTickets = ticketRepository.countByCreatedByEmailAndStatus(
                            email, TicketStatus.CLOSED);

            cancelledTickets = ticketRepository.countByCreatedByEmailAndStatus(
                            email, TicketStatus.CANCELLED);

            for (Category category : Category.values()) {
                categoryCounts.put(
                        category.name(),
                        ticketRepository.countByCreatedByEmailAndCategory(
                                email,
                                category
                        )
                );
            }

            for (Priority priority : Priority.values()) {
                priorityCounts.put(
                        priority.name(),
                        ticketRepository.countByCreatedByEmailAndPriority(
                                email,
                                priority
                        )
                );
            }
        }

        return new DashboardResponse(
                totalTickets,
                openTickets,
                assignedTickets,
                inProgressTickets,
                resolvedTickets,
                closedTickets,
                cancelledTickets,
                categoryCounts,
                priorityCounts
        );
    }
}