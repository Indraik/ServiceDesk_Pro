
package com.servicedesk.servicedesk_backend.service;

import com.servicedesk.servicedesk_backend.entity.*;
import com.servicedesk.servicedesk_backend.repository.TicketAssignmentHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.TicketRepository;
import com.servicedesk.servicedesk_backend.repository.TicketStatusHistoryRepository;
import com.servicedesk.servicedesk_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TicketServiceTest {

    private TicketRepository ticketRepository;
    private UserRepository userRepository;
    private TicketStatusHistoryRepository statusHistoryRepository;
    private TicketAssignmentHistoryRepository assignmentHistoryRepository;
    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketRepository = mock(TicketRepository.class);
        userRepository = mock(UserRepository.class);
        statusHistoryRepository = mock(TicketStatusHistoryRepository.class);
        assignmentHistoryRepository = mock(TicketAssignmentHistoryRepository.class);

        ticketService = new TicketService(
                ticketRepository,
                userRepository,
                statusHistoryRepository,
                assignmentHistoryRepository
        );
    }

    @Test
    void assignedAgentCanStartTicket() {
        User agent = mock(User.class);
        when(agent.getEmail()).thenReturn("agent@example.com");

        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(TicketStatus.ASSIGNED);
        when(ticket.getAssignedTo()).thenReturn(agent);
        User customer = mock(User.class);
        when(customer.getEmail()).thenReturn("customer@example.com");

        when(ticket.getCreatedBy()).thenReturn(customer);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));
        when(userRepository.findByEmail("agent@example.com"))
                .thenReturn(Optional.of(agent));

        when(ticketRepository.save(any(Ticket.class)))
                .thenReturn(ticket);

        assertDoesNotThrow(() ->
                ticketService.updateStatus(
                        1L,
                        TicketStatus.IN_PROGRESS,
                        "agent@example.com"
                )
        );

        verify(statusHistoryRepository).save(any(TicketStatusHistory.class));
        verify(ticketRepository).save(ticket);
    }

    @Test
    void customerCannotStartAssignedTicket() {
        User customer = mock(User.class);
        when(customer.getEmail()).thenReturn("customer@example.com");

        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(TicketStatus.ASSIGNED);
        when(ticket.getCreatedBy()).thenReturn(customer);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));
        when(userRepository.findByEmail("customer@example.com"))
                .thenReturn(Optional.of(customer));

        assertThrows(RuntimeException.class, () ->
                ticketService.updateStatus(
                        1L,
                        TicketStatus.IN_PROGRESS,
                        "customer@example.com"
                )
        );

        verify(ticketRepository, never()).save(any(Ticket.class));
        verify(statusHistoryRepository, never())
                .save(any(TicketStatusHistory.class));
    }
}
