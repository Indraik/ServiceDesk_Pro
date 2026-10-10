
package com.servicedesk.servicedesk_backend.exception;

public class TicketConflictException extends RuntimeException {

    public TicketConflictException(String message) {
        super(message);
    }
}
