package com.jivathunai.medical.health.repository.mysql;

import com.jivathunai.medical.health.entity.mysql.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {

    List<Booking> findByDoctorIdOrderByAppointmentDateTimeAsc(UUID doctorId);

    List<Booking> findByHospitalIdOrderByAppointmentDateTimeAsc(UUID hospitalId);

    List<Booking> findByOwnerIdOrderByAppointmentDateTimeDesc(UUID ownerId);

    List<Booking> findByOwnerIdInOrderByAppointmentDateTimeDesc(Collection<UUID> ownerIds);

    List<Booking> findByPetIdOrderByAppointmentDateTimeDesc(UUID petId);

    List<Booking> findByPetIdInOrderByAppointmentDateTimeDesc(Collection<UUID> petIds);

    @Query("SELECT b FROM Booking b WHERE b.ownerId IN :ownerIds OR b.petId IN :petIds ORDER BY b.appointmentDateTime DESC")
    List<Booking> findByOwnerIdsOrPetIdsIn(
            @Param("ownerIds") Collection<UUID> ownerIds,
            @Param("petIds") Collection<UUID> petIds
    );

    List<Booking> findByBookingStatus(Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.doctorId = :doctorId " +
           "AND b.appointmentDateTime < :endTime " +
           "AND FUNCTION('TIMESTAMPADD', MINUTE, b.durationMinutes, b.appointmentDateTime) > :startTime " +
           "AND b.bookingStatus NOT IN :excludedStatuses")
    List<Booking> findClashingBookings(
            @Param("doctorId") UUID doctorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludedStatuses") Collection<Booking.BookingStatus> excludedStatuses
    );
}
