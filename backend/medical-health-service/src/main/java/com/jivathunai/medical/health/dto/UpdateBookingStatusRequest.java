package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mysql.Booking;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBookingStatusRequest {

    @NotNull(message = "Booking status is required")
    private Booking.BookingStatus bookingStatus;

    private String cancellationReason;
    private String videoRoomId;
    private Booking.BillingStatus billingStatus;
}
