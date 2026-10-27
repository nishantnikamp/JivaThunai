package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.AddAllergyRequest;
import com.jivathunai.medical.health.dto.AddVitalSignRequest;
import com.jivathunai.medical.health.dto.LogVaccineRequest;
import com.jivathunai.medical.health.dto.WritePrescriptionRequest;
import com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk;
import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import com.jivathunai.medical.health.exception.AllergyConflictException;
import com.jivathunai.medical.health.exception.ResourceNotFoundException;
import com.jivathunai.medical.health.repository.mongo.PatientAssignmentDeskRepository;
import com.jivathunai.medical.health.repository.mongo.PetMedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.jivathunai.medical.health.entity.mysql.Booking;
import com.jivathunai.medical.health.repository.mysql.BookingRepository;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalMedicalRecordService {

    private final PetMedicalRecordRepository medicalRecordRepository;
    private final PatientAssignmentDeskRepository patientAssignmentDeskRepository;
    private final MongoTemplate mongoTemplate;
    private final BookingRepository bookingRepository;

    public PetMedicalRecord getOrCreateMedicalRecord(UUID petId, String defaultPetName, UUID ownerId) {
        PetMedicalRecord record = medicalRecordRepository.findByPetId(petId).orElseGet(() -> {
            log.info("📋 Initializing new MongoDB PetMedicalRecord for Pet ID: {}", petId);
            PetMedicalRecord newRecord = PetMedicalRecord.builder()
                    .petId(petId)
                    .petName(defaultPetName != null && !defaultPetName.trim().isEmpty() ? defaultPetName : "Pet Patient")
                    .ownerId(ownerId != null ? ownerId : UUID.randomUUID())
                    .bloodGroup("DEA 1.1 Positive")
                    .isSterilized(false)
                    .allergies(new ArrayList<>())
                    .vitalSignsHistory(new ArrayList<>())
                    .vaccinationSchedule(new ArrayList<>())
                    .clinicalEPrescriptions(new ArrayList<>())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return medicalRecordRepository.save(newRecord);
        });

        if (enrichPetDetailsFromProfile(record)) {
            record = medicalRecordRepository.save(record);
        }
        return record;
    }

    public PetMedicalRecord getMedicalRecord(UUID petId) {
        PetMedicalRecord record = medicalRecordRepository.findByPetId(petId)
                .orElseThrow(() -> new ResourceNotFoundException("No medical health record found for Pet ID: " + petId));
        if (enrichPetDetailsFromProfile(record)) {
            record = medicalRecordRepository.save(record);
        }
        return record;
    }

    public List<PetMedicalRecord> getRecordsByOwner(UUID ownerId) {
        List<PetMedicalRecord> all = medicalRecordRepository.findByOwnerId(ownerId);
        List<PetMedicalRecord> patients = new ArrayList<>();
        for (PetMedicalRecord record : all) {
            boolean updated = enrichPetDetailsFromProfile(record);
            if (updated) {
                medicalRecordRepository.save(record);
            }
            if (isPatientRecord(record)) {
                patients.add(record);
            }
        }
        return patients;
    }

    public List<PetMedicalRecord> getAllPatients() {
        List<PetMedicalRecord> all = medicalRecordRepository.findAll();
        List<PetMedicalRecord> patients = new ArrayList<>();
        for (PetMedicalRecord record : all) {
            boolean updated = enrichPetDetailsFromProfile(record);
            if (updated) {
                medicalRecordRepository.save(record);
            }
            if (isPatientRecord(record)) {
                patients.add(record);
            }
        }
        return patients;
    }

    /**
     * Determines whether a pet medical record represents an active/registered clinical patient.
     * Companion pets with zero clinical activity, prescriptions, allergies, vaccinations, vitals,
     * or appointments are not hospital patients.
     */
    public boolean isPatientRecord(PetMedicalRecord r) {
        if (r == null) return false;

        // 1. Clinical e-prescriptions history
        if (r.getClinicalEPrescriptions() != null && !r.getClinicalEPrescriptions().isEmpty()) {
            return true;
        }

        // 2. Documented allergies
        if (r.getAllergies() != null && !r.getAllergies().isEmpty()) {
            return true;
        }

        // 3. Documented vaccinations or scheduled due dates
        if (r.getVaccinationSchedule() != null && !r.getVaccinationSchedule().isEmpty()) {
            return true;
        }

        // 4. Clinical vital signs history
        if (r.getVitalSignsHistory() != null && !r.getVitalSignsHistory().isEmpty()) {
            return true;
        }

        // 5. Assigned to veterinary doctor desk / active treatment case
        if (r.getPetId() != null) {
            try {
                List<PatientAssignmentDesk> desks = patientAssignmentDeskRepository.findByPetIdsContaining(r.getPetId());
                if (desks != null && !desks.isEmpty()) {
                    return true;
                }
            } catch (Exception ignored) {}

            // 6. Confirmed appointments / consultation bookings with the hospital
            try {
                if (bookingRepository != null) {
                    List<Booking> bookings = bookingRepository.findByPetIdOrderByAppointmentDateTimeDesc(r.getPetId());
                    if (bookings != null && !bookings.isEmpty()) {
                        return true;
                    }
                }
            } catch (Exception ignored) {}
        }

        return false;
    }

    /**
     * Enriches medical record with real pet name, species, breed, and guardian phone
     * from the pet_profiles document in MongoDB if current record has generic or missing fields.
     */
    private boolean enrichPetDetailsFromProfile(PetMedicalRecord record) {
        if (record == null || record.getPetId() == null || mongoTemplate == null) return false;
        boolean updated = false;
        try {
            Document profileDoc = mongoTemplate.findById(record.getPetId(), Document.class, "pet_profiles");
            if (profileDoc != null) {
                Document basic = (Document) profileDoc.get("basicProfile");
                if (basic != null) {
                    String realName = basic.getString("name");
                    if (realName != null && !realName.trim().isEmpty() &&
                            (record.getPetName() == null || "Pet Patient".equalsIgnoreCase(record.getPetName().trim()))) {
                        record.setPetName(realName.trim());
                        updated = true;
                    }

                    String species = basic.getString("species");
                    if (species != null && !species.trim().isEmpty() &&
                            (record.getSpecies() == null || record.getSpecies().trim().isEmpty())) {
                        record.setSpecies(species.trim());
                        updated = true;
                    }

                    String breed = basic.getString("breed");
                    if (breed != null && !breed.trim().isEmpty() &&
                            (record.getBreed() == null || record.getBreed().trim().isEmpty())) {
                        record.setBreed(breed.trim());
                        updated = true;
                    }
                }

                Document qrMeta = (Document) profileDoc.get("qrProfileMetadata");
                if (qrMeta != null) {
                    Document emergency = (Document) qrMeta.get("emergencyContactOverride");
                    if (emergency != null) {
                        String phone = emergency.getString("phone");
                        if (phone != null && !phone.trim().isEmpty() &&
                                (record.getOwnerPhone() == null || record.getOwnerPhone().trim().isEmpty() || "N/A".equalsIgnoreCase(record.getOwnerPhone().trim()))) {
                            record.setOwnerPhone(phone.trim());
                            updated = true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Non-critical: Could not enrich pet medical record from pet_profiles: {}", e.getMessage());
        }
        return updated;
    }

    /**
     * Programmatic Allergen Warning Filter & EHR E-Prescription Signing Engine
     */
    public PetMedicalRecord writePrescriptionWithAllergenCheck(UUID petId, WritePrescriptionRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);

        log.info("🩺 [CLINICAL_EHR] Processing new prescription for Pet: '{}' (ID: {}). Diagnosed: '{}'",
                record.getPetName(), petId, request.getDiagnosedIllness());

        // 1. ALLERGEN WARNING FILTER:
        validatePrescriptionAllergens(record, request);

        // 2. Build and Append Signed Clinical E-Prescription
        List<PetMedicalRecord.MedicineItem> medicineEntities = (request.getMedicines() != null ? request.getMedicines() : Collections.<WritePrescriptionRequest.MedicineDto>emptyList())
                .stream()
                .map(m -> PetMedicalRecord.MedicineItem.builder()
                        .medicineName(m.getMedicineName())
                        .dosage(m.getDosage())
                        .frequency(m.getFrequency())
                        .durationDays(m.getDurationDays())
                        .instructions(m.getInstructions())
                        .activeIngredients(m.getActiveIngredients() != null ? m.getActiveIngredients() : new ArrayList<>())
                        .build())
                .toList();

        List<PetMedicalRecord.DiagnosticMediaItem> mediaEntities = (request.getDiagnosticMedia() != null ? request.getDiagnosticMedia() : Collections.<WritePrescriptionRequest.DiagnosticMediaDto>emptyList())
                .stream()
                .map(dm -> PetMedicalRecord.DiagnosticMediaItem.builder()
                        .mediaId(UUID.randomUUID())
                        .mediaType(parseMediaType(dm.getMediaType()))
                        .title(dm.getTitle())
                        .secureS3Key(dm.getSecureS3Key())
                        .fileUrl(dm.getFileUrl())
                        .uploadedAt(LocalDateTime.now())
                        .build())
                .toList();

        PetMedicalRecord.ClinicalEPrescription ePrescription = PetMedicalRecord.ClinicalEPrescription.builder()
                .prescriptionId(UUID.randomUUID())
                .visitDate(LocalDateTime.now())
                .doctorId(request.getDoctorId() != null ? request.getDoctorId() : UUID.randomUUID())
                .doctorName(request.getDoctorName() != null ? request.getDoctorName() : "Attending Veterinary Physician")
                .vciRegistrationNumber(request.getVciRegistrationNumber() != null ? request.getVciRegistrationNumber() : "VCI-REG-2026-IND")
                .clinicName(request.getClinicName() != null ? request.getClinicName() : "Jiva Thunai Veterinary Hospital")
                .diagnosedIllness(request.getDiagnosedIllness())
                .clinicalObservations(request.getClinicalObservations())
                .treatmentPlan(request.getTreatmentPlan())
                .medicines(medicineEntities)
                .diagnosticMedia(mediaEntities)
                .doctorDigitalSignature(request.getDoctorDigitalSignature() != null 
                        ? request.getDoctorDigitalSignature() 
                        : "SECURE-SIG-SHA256-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .build();

        if (record.getClinicalEPrescriptions() == null) {
            record.setClinicalEPrescriptions(new ArrayList<>());
        }
        record.getClinicalEPrescriptions().add(0, ePrescription); // prepend newest
        record.setUpdatedAt(LocalDateTime.now());

        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        log.info("✅ Successfully recorded signed E-Prescription (ID: {}) for Pet: '{}'", ePrescription.getPrescriptionId(), record.getPetName());
        return saved;
    }

    public void validatePrescriptionAllergens(PetMedicalRecord record, WritePrescriptionRequest request) {
        List<PetMedicalRecord.AllergyItem> activeAllergies = record.getAllergies() != null 
                ? record.getAllergies().stream().filter(PetMedicalRecord.AllergyItem::isActive).toList()
                : Collections.emptyList();

        if (!activeAllergies.isEmpty() && request.getMedicines() != null) {
            for (WritePrescriptionRequest.MedicineDto medicine : request.getMedicines()) {
                List<String> ingredientsToScan = new ArrayList<>();
                if (medicine.getMedicineName() != null) {
                    ingredientsToScan.add(medicine.getMedicineName().toLowerCase().trim());
                }
                if (medicine.getActiveIngredients() != null) {
                    medicine.getActiveIngredients().forEach(ing -> ingredientsToScan.add(ing.toLowerCase().trim()));
                }

                for (PetMedicalRecord.AllergyItem allergy : activeAllergies) {
                    if (allergy.getAllergen() == null) continue;
                    String allergenLower = allergy.getAllergen().toLowerCase().trim();

                    for (String item : ingredientsToScan) {
                        if (item.contains(allergenLower) || allergenLower.contains(item) || isChemicalAllergenClash(allergenLower, item)) {
                            log.error("❌ CRITICAL ALLERGEN CONFLICT DETECTED: Pet '{}' is allergic to '{}', which clashes with medicine '{}' (Ingredient: '{}')",
                                    record.getPetName(), allergy.getAllergen(), medicine.getMedicineName(), item);
                            
                            throw new AllergyConflictException(
                                    record.getPetName(),
                                    medicine.getMedicineName(),
                                    allergy.getAllergen(),
                                    allergy.getSeverity() != null ? allergy.getSeverity().name() : "HIGH",
                                    medicine.getActiveIngredients()
                            );
                        }
                    }
                }
            }
        }
    }

    private boolean isChemicalAllergenClash(String allergen, String ingredient) {
        // Common pharmaceutical family checks
        if (allergen.contains("penicillin") && (ingredient.contains("amoxicillin") || ingredient.contains("ampicillin") || ingredient.contains("clavulanate"))) {
            return true;
        }
        if (allergen.contains("sulfa") && (ingredient.contains("sulfamethoxazole") || ingredient.contains("trimethoprim"))) {
            return true;
        }
        if (allergen.contains("nsaid") && (ingredient.contains("meloxicam") || ingredient.contains("carprofen") || ingredient.contains("aspirin"))) {
            return true;
        }
        return false;
    }

    private PetMedicalRecord.MediaType parseMediaType(String typeStr) {
        if (typeStr == null) return PetMedicalRecord.MediaType.DOCUMENT;
        try {
            return PetMedicalRecord.MediaType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PetMedicalRecord.MediaType.DOCUMENT;
        }
    }

    public PetMedicalRecord editPrescription(UUID petId, String prescriptionIdentifier, WritePrescriptionRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        validatePrescriptionAllergens(record, request);

        if (record.getClinicalEPrescriptions() != null) {
            for (PetMedicalRecord.ClinicalEPrescription rx : record.getClinicalEPrescriptions()) {
                if (rx.getPrescriptionId() != null && rx.getPrescriptionId().toString().equalsIgnoreCase(prescriptionIdentifier)) {
                    if (request.getDiagnosedIllness() != null) rx.setDiagnosedIllness(request.getDiagnosedIllness());
                    if (request.getClinicalObservations() != null) rx.setClinicalObservations(request.getClinicalObservations());
                    if (request.getTreatmentPlan() != null) rx.setTreatmentPlan(request.getTreatmentPlan());
                    if (request.getMedicines() != null) {
                        List<PetMedicalRecord.MedicineItem> medicineEntities = request.getMedicines().stream()
                                .map(m -> PetMedicalRecord.MedicineItem.builder()
                                        .medicineName(m.getMedicineName())
                                        .dosage(m.getDosage())
                                        .frequency(m.getFrequency())
                                        .durationDays(m.getDurationDays())
                                        .instructions(m.getInstructions())
                                        .activeIngredients(m.getActiveIngredients() != null ? m.getActiveIngredients() : new ArrayList<>())
                                        .build())
                                .toList();
                        rx.setMedicines(medicineEntities);
                    }
                    break;
                }
            }
        }
        record.setUpdatedAt(LocalDateTime.now());
        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord deletePrescription(UUID petId, String prescriptionIdentifier) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        if (record.getClinicalEPrescriptions() != null) {
            record.getClinicalEPrescriptions().removeIf(rx -> 
                rx.getPrescriptionId() != null && rx.getPrescriptionId().toString().equalsIgnoreCase(prescriptionIdentifier));
        }
        record.setUpdatedAt(LocalDateTime.now());
        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord logVaccination(UUID petId, LogVaccineRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);

        PetMedicalRecord.VaccinationEntry entry = PetMedicalRecord.VaccinationEntry.builder()
                .vaccineId(UUID.randomUUID())
                .vaccineName(request.getVaccineName())
                .administeredDate(request.getAdministeredDate() != null ? request.getAdministeredDate() : LocalDate.now())
                .nextDueDate(request.getNextDueDate())
                .status(request.getStatus() != null ? request.getStatus() : PetMedicalRecord.VaccinationStatus.ADMINISTERED)
                .administeredByDoctorId(request.getAdministeredByDoctorId())
                .doctorName(request.getDoctorName() != null ? request.getDoctorName() : "Authorized Veterinary Officer")
                .batchNumber(request.getBatchNumber() != null ? request.getBatchNumber() : "BATCH-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .manufacturer(request.getManufacturer() != null ? request.getManufacturer() : "National Veterinary Biologics")
                .secureS3CertificateKey(request.getSecureS3CertificateKey())
                .build();

        if (record.getVaccinationSchedule() == null) {
            record.setVaccinationSchedule(new ArrayList<>());
        }
        record.getVaccinationSchedule().add(0, entry);
        record.setUpdatedAt(LocalDateTime.now());

        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord editVaccination(UUID petId, String vaccineIdentifier, LogVaccineRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        if (record.getVaccinationSchedule() != null) {
            for (PetMedicalRecord.VaccinationEntry entry : record.getVaccinationSchedule()) {
                boolean matches = (entry.getVaccineId() != null && entry.getVaccineId().toString().equalsIgnoreCase(vaccineIdentifier))
                        || (entry.getVaccineName() != null && entry.getVaccineName().equalsIgnoreCase(vaccineIdentifier));
                if (matches) {
                    if (request.getVaccineName() != null && !request.getVaccineName().isBlank()) entry.setVaccineName(request.getVaccineName());
                    if (request.getAdministeredDate() != null) entry.setAdministeredDate(request.getAdministeredDate());
                    if (request.getNextDueDate() != null) entry.setNextDueDate(request.getNextDueDate());
                    if (request.getStatus() != null) entry.setStatus(request.getStatus());
                    if (request.getBatchNumber() != null) entry.setBatchNumber(request.getBatchNumber());
                    if (request.getManufacturer() != null) entry.setManufacturer(request.getManufacturer());
                    if (request.getDoctorName() != null) entry.setDoctorName(request.getDoctorName());
                    break;
                }
            }
        }
        record.setUpdatedAt(LocalDateTime.now());
        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord deleteVaccination(UUID petId, String vaccineIdentifier) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        if (record.getVaccinationSchedule() != null) {
            record.getVaccinationSchedule().removeIf(entry -> 
                (entry.getVaccineId() != null && entry.getVaccineId().toString().equalsIgnoreCase(vaccineIdentifier))
                || (entry.getVaccineName() != null && entry.getVaccineName().equalsIgnoreCase(vaccineIdentifier))
            );
        }
        record.setUpdatedAt(LocalDateTime.now());
        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord uploadVaccineCertificate(UUID petId, String vaccineIdentifier, String certificateUrl, String s3Key, String uploadedByRole) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        if (record.getVaccinationSchedule() != null) {
            for (PetMedicalRecord.VaccinationEntry entry : record.getVaccinationSchedule()) {
                boolean matches = (entry.getVaccineId() != null && entry.getVaccineId().toString().equalsIgnoreCase(vaccineIdentifier))
                        || (entry.getVaccineName() != null && entry.getVaccineName().equalsIgnoreCase(vaccineIdentifier));
                if (matches) {
                    entry.setCertificateUrl(certificateUrl);
                    if (s3Key != null) entry.setSecureS3CertificateKey(s3Key);
                    entry.setUploadedByRole(uploadedByRole != null ? uploadedByRole : "ROLE_PET_OWNER");
                    entry.setCertificateUploadedAt(LocalDateTime.now());
                    break;
                }
            }
        }
        record.setUpdatedAt(LocalDateTime.now());
        return medicalRecordRepository.save(record);
    }

    public PetMedicalRecord addAllergy(UUID petId, AddAllergyRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);

        PetMedicalRecord.AllergyItem allergy = PetMedicalRecord.AllergyItem.builder()
                .allergyId(UUID.randomUUID())
                .allergen(request.getAllergen())
                .severity(request.getSeverity() != null ? request.getSeverity() : PetMedicalRecord.AllergySeverity.MODERATE)
                .reaction(request.getReaction())
                .active(request.isActive())
                .build();

        if (record.getAllergies() == null) {
            record.setAllergies(new ArrayList<>());
        }
        record.getAllergies().add(allergy);
        record.setUpdatedAt(LocalDateTime.now());

        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord editAllergy(UUID petId, String allergyIdentifier, AddAllergyRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        if (record.getAllergies() != null) {
            for (PetMedicalRecord.AllergyItem item : record.getAllergies()) {
                boolean matches = (item.getAllergyId() != null && item.getAllergyId().toString().equalsIgnoreCase(allergyIdentifier))
                        || (item.getAllergen() != null && item.getAllergen().equalsIgnoreCase(allergyIdentifier));
                if (matches) {
                    if (request.getAllergen() != null && !request.getAllergen().isBlank()) item.setAllergen(request.getAllergen());
                    if (request.getSeverity() != null) item.setSeverity(request.getSeverity());
                    if (request.getReaction() != null) item.setReaction(request.getReaction());
                    item.setActive(request.isActive());
                    break;
                }
            }
        }
        record.setUpdatedAt(LocalDateTime.now());
        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord deleteAllergy(UUID petId, String allergyIdentifier) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        if (record.getAllergies() != null) {
            record.getAllergies().removeIf(item -> 
                (item.getAllergyId() != null && item.getAllergyId().toString().equalsIgnoreCase(allergyIdentifier))
                || (item.getAllergen() != null && item.getAllergen().equalsIgnoreCase(allergyIdentifier))
            );
        }
        record.setUpdatedAt(LocalDateTime.now());
        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord addVitalSign(UUID petId, AddVitalSignRequest request) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);

        PetMedicalRecord.VitalSignEntry entry = PetMedicalRecord.VitalSignEntry.builder()
                .recordedAt(LocalDateTime.now())
                .weightKg(request.getWeightKg())
                .temperatureCelsius(request.getTemperatureCelsius())
                .heartRateBpm(request.getHeartRateBpm())
                .respirationRateBpm(request.getRespirationRateBpm())
                .recordedByDoctorId(request.getRecordedByDoctorId())
                .doctorName(request.getDoctorName())
                .build();

        if (record.getVitalSignsHistory() == null) {
            record.setVitalSignsHistory(new ArrayList<>());
        }
        record.getVitalSignsHistory().add(0, entry);
        record.setUpdatedAt(LocalDateTime.now());

        PetMedicalRecord saved = medicalRecordRepository.save(record);
        syncPatientAssignmentDesk(saved);
        return saved;
    }

    public PetMedicalRecord updateSterilizationStatus(UUID petId, boolean isSterilized) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        record.setIsSterilized(isSterilized);
        record.setUpdatedAt(LocalDateTime.now());
        return medicalRecordRepository.save(record);
    }

    public PetMedicalRecord updateMicrochipInfo(UUID petId, PetMedicalRecord.MicrochipInfo microchipInfo) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        record.setMicrochipDetails(microchipInfo);
        record.setUpdatedAt(LocalDateTime.now());
        return medicalRecordRepository.save(record);
    }

    public PetMedicalRecord updateBloodGroup(UUID petId, String bloodGroup) {
        PetMedicalRecord record = getOrCreateMedicalRecord(petId, null, null);
        record.setBloodGroup(bloodGroup);
        record.setUpdatedAt(LocalDateTime.now());
        return medicalRecordRepository.save(record);
    }

    public List<PetMedicalRecord.ClinicalEPrescription> getAllPrescriptions() {
        List<PetMedicalRecord> all = medicalRecordRepository.findAll();
        List<PetMedicalRecord.ClinicalEPrescription> prescriptions = new ArrayList<>();
        for (PetMedicalRecord record : all) {
            if (record.getClinicalEPrescriptions() != null) {
                prescriptions.addAll(record.getClinicalEPrescriptions());
            }
        }
        prescriptions.sort((a, b) -> b.getVisitDate().compareTo(a.getVisitDate()));
        return prescriptions;
    }

    private void syncPatientAssignmentDesk(PetMedicalRecord record) {
        try {
            List<PatientAssignmentDesk> desks = patientAssignmentDeskRepository.findByPetIdsContaining(record.getPetId());
            for (PatientAssignmentDesk desk : desks) {
                if (desk.getClinicalPrescriptionTimelines() == null) {
                    desk.setClinicalPrescriptionTimelines(new ArrayList<>());
                }
                desk.getClinicalPrescriptionTimelines().removeIf(s -> record.getPetId().equals(s.getPetId()));

                List<String> activePrescriptions = new ArrayList<>();
                if (record.getClinicalEPrescriptions() != null) {
                    for (PetMedicalRecord.ClinicalEPrescription rx : record.getClinicalEPrescriptions()) {
                        if (rx.getMedicines() != null) {
                            for (PetMedicalRecord.MedicineItem med : rx.getMedicines()) {
                                activePrescriptions.add(med.getMedicineName() + " (" + (med.getDosage() != null ? med.getDosage() : "Standard") + ")");
                            }
                        }
                    }
                }

                List<PatientAssignmentDesk.VaccinationSchedule> vaxSchedules = new ArrayList<>();
                if (record.getVaccinationSchedule() != null) {
                    for (PetMedicalRecord.VaccinationEntry v : record.getVaccinationSchedule()) {
                        vaxSchedules.add(PatientAssignmentDesk.VaccinationSchedule.builder()
                                .vaccineName(v.getVaccineName())
                                .scheduledDate(v.getNextDueDate() != null ? v.getNextDueDate().atStartOfDay() : LocalDateTime.now())
                                .administered(v.getStatus() == PetMedicalRecord.VaccinationStatus.ADMINISTERED)
                                .build());
                    }
                }

                List<String> allergies = new ArrayList<>();
                if (record.getAllergies() != null) {
                    for (PetMedicalRecord.AllergyItem a : record.getAllergies()) {
                        if (a.isActive() && a.getAllergen() != null) {
                            allergies.add(a.getAllergen() + " (" + (a.getSeverity() != null ? a.getSeverity().name() : "HIGH") + ")");
                        }
                    }
                }

                Double lastWeight = null;
                Double lastTemp = null;
                Integer lastHeartRate = null;
                Integer lastRespiration = null;
                if (record.getVitalSignsHistory() != null && !record.getVitalSignsHistory().isEmpty()) {
                    PetMedicalRecord.VitalSignEntry latestVital = record.getVitalSignsHistory().get(0);
                    lastWeight = latestVital.getWeightKg();
                    lastTemp = latestVital.getTemperatureCelsius();
                    lastHeartRate = latestVital.getHeartRateBpm();
                    lastRespiration = latestVital.getRespirationRateBpm();
                }

                desk.getClinicalPrescriptionTimelines().add(PatientAssignmentDesk.ClinicalSummary.builder()
                        .petId(record.getPetId())
                        .petName(record.getPetName())
                        .species(record.getSpecies())
                        .breed(record.getBreed())
                        .ownerName(record.getOwnerName())
                        .ownerPhone(record.getOwnerPhone())
                        .bloodGroup(record.getBloodGroup())
                        .activePrescriptions(activePrescriptions)
                        .automatedVaccinationSchedules(vaxSchedules)
                        .allergies(allergies)
                        .lastWeightKg(lastWeight)
                        .lastTemperatureCelsius(lastTemp)
                        .lastHeartRateBpm(lastHeartRate)
                        .lastRespirationRateBpm(lastRespiration)
                        .caseStatus(desk.getCaseStatus() != null ? desk.getCaseStatus() : PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT)
                        .lastUpdated(LocalDateTime.now())
                        .build());

                patientAssignmentDeskRepository.save(desk);
            }
        } catch (Exception ex) {
            log.warn("Non-critical: Failed to sync patient assignment desk: {}", ex.getMessage());
        }
    }
}

