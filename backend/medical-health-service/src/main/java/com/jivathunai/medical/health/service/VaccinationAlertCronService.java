package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import com.jivathunai.medical.health.event.KafkaAlertDispatcher;
import com.jivathunai.medical.health.event.VaccineAlertEvent;
import com.jivathunai.medical.health.repository.mongo.PetMedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccinationAlertCronService {

    private final PetMedicalRecordRepository medicalRecordRepository;
    private final KafkaAlertDispatcher alertDispatcher;

    /**
     * Automated Multi-Channel Vaccination Reminder Engine
     * Executes daily at 08:00 AM (or on configured cron).
     * Scans MongoDB collection via compound index on (vaccinationSchedule.nextDueDate, vaccinationSchedule.status).
     */
    @Scheduled(cron = "${app.vaccination.cron:0 0 8 * * ?}")
    public void executeDailyVaccinationReminderScan() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAhead = today.plusDays(7);

        log.info("⏰ [CRON_ENGINE] Starting Automated Multi-Key Vaccination Reminder Scan for target date: {} (7-day window) & OVERDUE vaccines...", sevenDaysAhead);

        int alertsDispatched = 0;
        int recordsProcessed = 0;

        // 1. Fetch records with vaccinations due up to 7 days ahead or carrying OVERDUE status
        List<PetMedicalRecord> records = medicalRecordRepository.findRecordsWithDueOrOverdueVaccinations(sevenDaysAhead);

        for (PetMedicalRecord record : records) {
            recordsProcessed++;
            boolean recordUpdated = false;

            if (record.getVaccinationSchedule() == null) continue;

            for (PetMedicalRecord.VaccinationEntry vax : record.getVaccinationSchedule()) {
                if (vax.getNextDueDate() == null) continue;

                // Auto-mark overdue if due date has passed and still in SCHEDULED status
                if (vax.getNextDueDate().isBefore(today) && vax.getStatus() == PetMedicalRecord.VaccinationStatus.SCHEDULED) {
                    vax.setStatus(PetMedicalRecord.VaccinationStatus.OVERDUE);
                    recordUpdated = true;
                }

                boolean isDueIn7Days = vax.getNextDueDate().isEqual(sevenDaysAhead);
                boolean isOverdue = vax.getStatus() == PetMedicalRecord.VaccinationStatus.OVERDUE;

                if (isDueIn7Days || isOverdue) {
                    long daysDiff = ChronoUnit.DAYS.between(today, vax.getNextDueDate());

                    String doctorRecommendation = isOverdue
                            ? String.format("URGENT: %s booster is OVERDUE by %d days. Immediate veterinary administration recommended to maintain immunity.", vax.getVaccineName(), Math.abs(daysDiff))
                            : String.format("REMINDER: %s booster is due in 7 days (%s). Please confirm your clinic appointment.", vax.getVaccineName(), vax.getNextDueDate());

                    VaccineAlertEvent alertEvent = VaccineAlertEvent.builder()
                            .alertId(UUID.randomUUID())
                            .petId(record.getPetId())
                            .petName(record.getPetName())
                            .ownerId(record.getOwnerId())
                            .ownerName(record.getOwnerName() != null ? record.getOwnerName() : "Pet Owner")
                            .ownerPhone(record.getOwnerPhone() != null ? record.getOwnerPhone() : "+91-9876543210")
                            .ownerEmail(record.getOwnerEmail() != null ? record.getOwnerEmail() : "guardian@jivathunai.in")
                            .vaccineId(vax.getVaccineId())
                            .vaccineName(vax.getVaccineName())
                            .nextDueDate(vax.getNextDueDate())
                            .status(vax.getStatus() != null ? vax.getStatus().name() : "SCHEDULED")
                            .daysRemaining(daysDiff)
                            .doctorRecommendations(doctorRecommendation)
                            .clinicName("Jiva Thunai Certified Veterinary Hospital")
                            .build();

                    alertDispatcher.dispatchVaccineAlert(alertEvent);
                    alertsDispatched++;
                }
            }

            if (recordUpdated) {
                medicalRecordRepository.save(record);
            }
        }

        log.info("🎯 [CRON_ENGINE] Vaccination reminder scan completed. Processed {} records, emitted {} Kafka VaccineAlertEvent packets.",
                recordsProcessed, alertsDispatched);
    }

    /**
     * Manual Trigger for Admin Workspace / Integration Testing
     */
    public int triggerManualScan() {
        executeDailyVaccinationReminderScan();
        return 1;
    }
}
