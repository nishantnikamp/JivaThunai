package com.jivathunai.medical.health.entity.mysql;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vet_bookings", indexes = {
    @Index(name = "idx_booking_doctor_datetime", columnList = "doctor_id, appointment_date_time"),
    @Index(name = "idx_booking_pet", columnList = "pet_id"),
    @Index(name = "idx_booking_owner", columnList = "owner_id"),
    @Index(name = "idx_booking_hospital", columnList = "hospital_id"),
    @Index(name = "idx_booking_status", columnList = "booking_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_id", updatable = false, nullable = false)
    private UUID bookingId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "pet_name")
    private String petName;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_phone")
    private String ownerPhone;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "hospital_name")
    private String hospitalName;

    @Column(name = "appointment_date_time", nullable = false)
    private LocalDateTime appointmentDateTime;

    @Builder.Default
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(name = "consultation_type", nullable = false, length = 30)
    private ConsultationType consultationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 30)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_status", nullable = false, length = 30)
    private BillingStatus billingStatus;

    @Column(name = "symptoms", length = 1000)
    private String symptoms;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "video_room_id")
    private String videoRoomId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ConsultationType {
        IN_CLINIC, VIDEO_CONSULTATION, EMERGENCY_HOME_VISIT
    }

    public enum BookingStatus {
        PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum BillingStatus {
        UNPAID, PAID, REFUNDED
    }
}
