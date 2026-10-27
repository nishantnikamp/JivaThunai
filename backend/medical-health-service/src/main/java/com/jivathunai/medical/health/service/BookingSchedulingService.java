package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.CreateBookingRequest;
import com.jivathunai.medical.health.dto.UpdateBookingStatusRequest;
import com.jivathunai.medical.health.entity.mysql.Booking;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.exception.BookingConflictException;
import com.jivathunai.medical.health.exception.ResourceNotFoundException;
import com.jivathunai.medical.health.repository.mysql.BookingRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingSchedulingService {

    private final BookingRepository bookingRepository;
    private final VetStaffRegistryRepository staffRegistryRepository;
    private final com.jivathunai.medical.health.repository.mongo.PatientAssignmentDeskRepository patientAssignmentDeskRepository;

    public static UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return null;
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    public static List<UUID> parseCandidateUuids(String val) {
        if (val == null || val.trim().isEmpty()) return java.util.Collections.emptyList();
        List<UUID> list = new java.util.ArrayList<>();
        String trimmed = val.trim();
        try {
            list.add(UUID.fromString(trimmed));
        } catch (IllegalArgumentException ignored) {
        }
        UUID hashed = UUID.nameUUIDFromBytes(trimmed.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        if (!list.contains(hashed)) {
            list.add(hashed);
        }
        return list;
    }

    @Transactional
    public Booking createAppointment(CreateBookingRequest request) {
        log.info("📅 [BOOKING_INTERCEPTOR] Validating new appointment request for Pet: {} with Doctor: {} at {}",
                request.getPetId(), request.getDoctorId(), request.getAppointmentDateTime());

        UUID doctorUuid = toUuid(request.getDoctorId());
        UUID petUuid = toUuid(request.getPetId());
        UUID ownerUuid = toUuid(request.getOwnerId());
        UUID hospitalUuid = toUuid(request.getHospitalId());

        // 1. Verify Doctor is ACTIVE in MySQL Roster Registry (if registered)
        if (doctorUuid != null) {
            staffRegistryRepository.findByUserId(doctorUuid)
                    .ifPresent(staff -> {
                        if (staff.getEmploymentStatus() != VetStaffRegistry.EmploymentStatus.ACTIVE) {
                            throw new BookingConflictException(
                                    doctorUuid,
                                    request.getAppointmentDateTime(),
                                    "Doctor is currently " + staff.getEmploymentStatus() + " in registry roster and cannot accept appointments."
                            );
                        }
                    });
        }

        // 2. Atomic Query: Check for overlapping/clashing slots for the Doctor
        int duration = request.getDurationMinutes() != null && request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 30;
        LocalDateTime startTime = request.getAppointmentDateTime();
        LocalDateTime endTime = startTime.plusMinutes(duration);

        if (doctorUuid != null) {
            List<Booking> clashingBookings = bookingRepository.findClashingBookings(
                    doctorUuid,
                    startTime,
                    endTime,
                    Set.of(Booking.BookingStatus.CANCELLED)
            );

            if (!clashingBookings.isEmpty()) {
                Booking clashing = clashingBookings.get(0);
                throw new BookingConflictException(
                        doctorUuid,
                        startTime,
                        String.format("Doctor already has an active appointment (ID: %s) booked from %s to %s",
                                clashing.getBookingId(),
                                clashing.getAppointmentDateTime(),
                                clashing.getAppointmentDateTime().plusMinutes(clashing.getDurationMinutes()))
                );
            }
        }

        // 3. Persist Booking as CONFIRMED
        Booking booking = Booking.builder()
                .doctorId(doctorUuid != null ? doctorUuid : UUID.randomUUID())
                .doctorName(request.getDoctorName() != null ? request.getDoctorName() : "Attending Veterinary Surgeon")
                .petId(petUuid != null ? petUuid : UUID.randomUUID())
                .petName(request.getPetName() != null ? request.getPetName() : "Registered Patient")
                .ownerId(ownerUuid != null ? ownerUuid : UUID.randomUUID())
                .ownerName(request.getOwnerName() != null ? request.getOwnerName() : "Pet Guardian")
                .ownerPhone(request.getOwnerPhone())
                .hospitalId(hospitalUuid)
                .hospitalName(request.getHospitalName() != null ? request.getHospitalName() : "Jiva Thunai Partner Clinic")
                .appointmentDateTime(request.getAppointmentDateTime())
                .durationMinutes(duration)
                .consultationType(request.getConsultationType())
                .bookingStatus(Booking.BookingStatus.CONFIRMED)
                .billingStatus(Booking.BillingStatus.UNPAID)
                .symptoms(request.getSymptoms())
                .videoRoomId(request.getConsultationType() == Booking.ConsultationType.VIDEO_CONSULTATION 
                        ? "JT-ROOM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() 
                        : null)
                .build();

        Booking saved = bookingRepository.save(booking);

        // 4. Auto-link / ensure PatientAssignmentDesk in MongoDB
        autoLinkPatientToDoctor(saved.getDoctorId(), saved.getDoctorName(), saved.getPetId(), saved.getHospitalId(), saved.getHospitalName());

        log.info("✅ Appointment successfully booked and confirmed. Booking ID: {}", saved.getBookingId());
        return saved;
    }

    @Transactional
    public Booking updateBookingStatus(UUID bookingId, UpdateBookingStatusRequest request, String performingStaffRole) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        log.info("🔄 Updating booking ID: {} from status: {} to status: {} by role: {}",
                bookingId, booking.getBookingStatus(), request.getBookingStatus(), performingStaffRole);

        booking.setBookingStatus(request.getBookingStatus());

        if (request.getBillingStatus() != null) {
            booking.setBillingStatus(request.getBillingStatus());
        }

        if (request.getCancellationReason() != null) {
            booking.setCancellationReason(request.getCancellationReason());
        }

        if (request.getVideoRoomId() != null) {
            booking.setVideoRoomId(request.getVideoRoomId());
        }

        if (request.getBookingStatus() == Booking.BookingStatus.IN_PROGRESS || request.getBookingStatus() == Booking.BookingStatus.COMPLETED) {
            autoLinkPatientToDoctor(booking.getDoctorId(), booking.getDoctorName(), booking.getPetId(), booking.getHospitalId(), booking.getHospitalName());
        }

        return bookingRepository.save(booking);
    }

    private void autoLinkPatientToDoctor(UUID doctorId, String doctorName, UUID petId, UUID hospitalId, String hospitalName) {
        if (doctorId == null || petId == null) return;
        try {
            List<com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk> existing = patientAssignmentDeskRepository.findByDoctorId(doctorId);
            boolean alreadyAssigned = existing.stream().anyMatch(d -> d.getPetIds() != null && d.getPetIds().contains(petId));
            if (!alreadyAssigned) {
                com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk desk = com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk.builder()
                        .assignmentId(UUID.randomUUID())
                        .doctorId(doctorId)
                        .doctorName(doctorName)
                        .petIds(new java.util.ArrayList<>(List.of(petId)))
                        .parentOrganizationId(hospitalId)
                        .hospitalName(hospitalName)
                        .caseStatus(com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT)
                        .clinicalPrescriptionTimelines(new java.util.ArrayList<>())
                        .build();
                patientAssignmentDeskRepository.save(desk);
                log.info("🔗 Auto-linked Pet {} to Doctor {} in PatientAssignmentDesk", petId, doctorId);
            }
        } catch (Exception e) {
            log.warn("Non-critical: Could not auto-link patient to doctor desk: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Booking> getHospitalAppointmentQueue(UUID hospitalId) {
        if (hospitalId == null) {
            return bookingRepository.findAll();
        }
        return bookingRepository.findByHospitalIdOrderByAppointmentDateTimeAsc(hospitalId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getDoctorAppointmentQueue(UUID doctorId) {
        return bookingRepository.findByDoctorIdOrderByAppointmentDateTimeAsc(doctorId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getOwnerAppointments(UUID ownerId) {
        return bookingRepository.findByOwnerIdOrderByAppointmentDateTimeDesc(ownerId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getPetAppointments(UUID petId) {
        return bookingRepository.findByPetIdOrderByAppointmentDateTimeDesc(petId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getOwnerAndPetsAppointments(java.util.Collection<UUID> ownerUuids, java.util.Collection<UUID> petUuids) {
        boolean hasOwners = ownerUuids != null && !ownerUuids.isEmpty();
        boolean hasPets = petUuids != null && !petUuids.isEmpty();

        if (hasOwners && hasPets) {
            return bookingRepository.findByOwnerIdsOrPetIdsIn(ownerUuids, petUuids);
        } else if (hasOwners) {
            return bookingRepository.findByOwnerIdInOrderByAppointmentDateTimeDesc(ownerUuids);
        } else if (hasPets) {
            return bookingRepository.findByPetIdInOrderByAppointmentDateTimeDesc(petUuids);
        }
        return java.util.Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
    }
}
