package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mysql.Booking;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull(message = "Doctor ID is required")
    private String doctorId;

    private String doctorName;

    @NotNull(message = "Pet ID is required")
    private String petId;

    private String petName;

    @NotNull(message = "Owner ID is required")
    private String ownerId;

    private String ownerName;
    private String ownerPhone;

    private String hospitalId;
    private String hospitalName;

    @NotNull(message = "Appointment date and time is required")
    private LocalDateTime appointmentDateTime;

    @Builder.Default
    private Integer durationMinutes = 30;

    @NotNull(message = "Consultation type is required")
    private Booking.ConsultationType consultationType;

    private String symptoms;
}

