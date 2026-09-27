package com.servicedesk.servicedesk_backend.exception;

public class InvalidTicketStatusException extends RuntimeException{
    public InvalidTicketStatusException(String message) {
        super(message);
    }
}
