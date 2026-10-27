package com.jivathunai.medical.health.exception;

import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class BookingConflictException extends RuntimeException {

    private final UUID doctorId;
    private final LocalDateTime requestedDateTime;
    private final String reason;

    public BookingConflictException(UUID doctorId, LocalDateTime requestedDateTime, String reason) {
        super(String.format("Booking Conflict for Doctor '%s' at %s: %s", doctorId, requestedDateTime, reason));
        this.doctorId = doctorId;
        this.requestedDateTime = requestedDateTime;
        this.reason = reason;
    }

    public BookingConflictException(String message) {
        super(message);
        this.doctorId = null;
        this.requestedDateTime = null;
        this.reason = message;
    }
}
