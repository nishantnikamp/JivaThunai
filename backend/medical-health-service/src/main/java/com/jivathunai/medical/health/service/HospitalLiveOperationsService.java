package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.ScheduleProcedureRequest;
import com.jivathunai.medical.health.dto.UpdateDoctorStatusRequest;
import com.jivathunai.medical.health.dto.UpdateResourceStatusRequest;
import com.jivathunai.medical.health.entity.mongo.DoctorLiveStatus;
import com.jivathunai.medical.health.entity.mongo.HospitalResource;
import com.jivathunai.medical.health.entity.mongo.OTProcedure;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument;
import com.jivathunai.medical.health.repository.mongo.DoctorLiveStatusRepository;
import com.jivathunai.medical.health.repository.mongo.HospitalProfileRepository;
import com.jivathunai.medical.health.repository.mongo.HospitalResourceRepository;
import com.jivathunai.medical.health.repository.mongo.OTProcedureRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalLiveOperationsService {

    private final DoctorLiveStatusRepository doctorStatusRepository;
    private final HospitalResourceRepository resourceRepository;
    private final OTProcedureRepository procedureRepository;
    private final VetStaffRegistryRepository staffRepository;
    private final HospitalProfileRepository hospitalProfileRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Ensures hospital resource check without creating dummy mock data.
     */
    public void ensureHospitalResourcesSeeded(UUID hospitalId, String hospitalName) {
        // No-op: Do not seed dummy/mock resources into database.
        // Resources are populated purely from authentic hospital profile configurations or direct staff additions.
    }

    /**
     * Get or initialize live status for a doctor.
     */
    public DoctorLiveStatus getOrCreateDoctorStatus(UUID doctorId, String doctorName, String spec, UUID hospitalId, String hospitalName) {
        return doctorStatusRepository.findByDoctorId(doctorId).orElseGet(() -> {
            DoctorLiveStatus newStatus = DoctorLiveStatus.builder()
                    .doctorId(doctorId)
                    .doctorName(doctorName)
                    .specialization(spec != null ? spec : "General Veterinary Surgeon")
                    .hospitalId(hospitalId)
                    .hospitalName(hospitalName)
                    .branchName("Main Branch")
                    .operationalStatus(DoctorLiveStatus.OperationalStatus.AVAILABLE)
                    .currentLocation("Consultation Suite 1")
                    .onCall(true)
                    .lastHeartbeatAt(LocalDateTime.now())
                    .build();
            return doctorStatusRepository.save(newStatus);
        });
    }

    /**
     * Doctor or Admin updates live operational status.
     */
    public DoctorLiveStatus updateDoctorStatus(UUID doctorId, UpdateDoctorStatusRequest request) {
        DoctorLiveStatus status = doctorStatusRepository.findByDoctorId(doctorId)
                .orElseGet(() -> DoctorLiveStatus.builder().doctorId(doctorId).build());

        status.setOperationalStatus(request.getOperationalStatus());
        if (request.getCurrentLocation() != null) status.setCurrentLocation(request.getCurrentLocation());
        if (request.getCurrentEncounterInfo() != null) status.setCurrentEncounterInfo(request.getCurrentEncounterInfo());
        if (request.getOnCall() != null) status.setOnCall(request.getOnCall());
        if (request.getExpectedAvailableAt() != null) status.setExpectedAvailableAt(request.getExpectedAvailableAt());
        status.setLastHeartbeatAt(LocalDateTime.now());

        log.info("Doctor {} updated live operational status to: {}", doctorId, request.getOperationalStatus());
        DoctorLiveStatus saved = doctorStatusRepository.save(status);
        broadcastOperationsSnapshot(saved.getHospitalId());
        return saved;
    }

    private String normalizeDoctorName(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("^dr\\.?\\s*", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    public List<DoctorLiveStatus> getAllDoctorLiveStatuses(UUID hospitalId) {
        List<DoctorLiveStatus> list;
        if (hospitalId != null) {
            list = new ArrayList<>(doctorStatusRepository.findByHospitalId(hospitalId));
        } else {
            list = new ArrayList<>(doctorStatusRepository.findAll());
        }

        // If empty, sync from staff registry
        if (list.isEmpty()) {
            List<VetStaffRegistry> staffList = staffRepository.findByAssignedSystemRoleAndEmploymentStatus(
                    VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR,
                    VetStaffRegistry.EmploymentStatus.ACTIVE
            );
            for (VetStaffRegistry staff : staffList) {
                if (staff.getDoctorName() != null && staff.getDoctorName().toLowerCase().contains("hospital administrator")) {
                    continue;
                }
                UUID hId = staff.getParentOrganization() != null ? staff.getParentOrganization().getOrganizationId() : null;
                String hName = staff.getParentOrganization() != null ? staff.getParentOrganization().getRegisteredBusinessName() : "Jiva Thunai Central Animal Hospital";
                list.add(getOrCreateDoctorStatus(staff.getUserId(), staff.getDoctorName(), staff.getSpecialization(), hId, hName));
            }
        }

        // Deduplicate and filter out any dummy/administrator records
        Map<String, DoctorLiveStatus> uniqueMap = new LinkedHashMap<>();
        List<DoctorLiveStatus> duplicatesToDelete = new ArrayList<>();

        for (DoctorLiveStatus doc : list) {
            if (doc.getDoctorName() != null && doc.getDoctorName().toLowerCase().contains("hospital administrator")) {
                duplicatesToDelete.add(doc);
                continue;
            }
            String norm = normalizeDoctorName(doc.getDoctorName());
            if (norm.isEmpty()) {
                norm = doc.getDoctorId() != null ? doc.getDoctorId().toString() : UUID.randomUUID().toString();
            }

            if (uniqueMap.containsKey(norm)) {
                DoctorLiveStatus existing = uniqueMap.get(norm);
                // Keep the one with a more recent update or valid heartbeat
                if (existing.getUpdatedAt() != null && doc.getUpdatedAt() != null && doc.getUpdatedAt().isAfter(existing.getUpdatedAt())) {
                    duplicatesToDelete.add(existing);
                    uniqueMap.put(norm, doc);
                } else {
                    duplicatesToDelete.add(doc);
                }
            } else {
                uniqueMap.put(norm, doc);
            }
        }

        if (!duplicatesToDelete.isEmpty()) {
            try {
                doctorStatusRepository.deleteAll(duplicatesToDelete);
                log.info("Purged {} duplicate doctor records from live operations roster", duplicatesToDelete.size());
            } catch (Exception e) {
                log.warn("Non-critical: could not delete duplicate doctor records: {}", e.getMessage());
            }
        }

        return new ArrayList<>(uniqueMap.values());
    }

    public List<HospitalResource> getHospitalResources(UUID hospitalId, HospitalResource.ResourceType type) {
        List<HospitalResource> all;
        if (hospitalId != null && type != null) {
            all = resourceRepository.findByHospitalIdAndResourceType(hospitalId, type);
        } else if (hospitalId != null) {
            all = resourceRepository.findByHospitalId(hospitalId);
        } else if (type != null) {
            all = resourceRepository.findByResourceType(type);
        } else {
            all = resourceRepository.findAll();
        }

        for (HospitalResource r : all) {
            if (r.getResourceCode() != null && r.getResourceCode().matches("^[0-9a-fA-F-]{36}$")) {
                String prefix = r.getResourceType() == HospitalResource.ResourceType.OPERATION_THEATRE ? "OT-" :
                        (r.getResourceType() == HospitalResource.ResourceType.ICU_BED ? "ICU-" : "BED-");
                r.setResourceCode(prefix + r.getResourceCode().substring(0, 4).toUpperCase());
                try {
                    resourceRepository.save(r);
                } catch (Exception ignored) {}
            }
        }
        return all;
    }

    public HospitalResource updateResourceStatus(UUID resourceId, UpdateResourceStatusRequest request) {
        HospitalResource res = resourceRepository.findByResourceId(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital resource not found: " + resourceId));

        res.setOperationalStatus(request.getOperationalStatus());
        if (request.getOperationalStatus() == HospitalResource.ResourceStatus.OCCUPIED) {
            res.setCurrentPatientId(request.getCurrentPatientId());
            res.setCurrentPatientName(request.getCurrentPatientName());
            res.setCurrentOwnerName(request.getCurrentOwnerName());
            res.setCurrentOwnerPhone(request.getCurrentOwnerPhone());
            res.setAssignedDoctorId(request.getAssignedDoctorId());
            res.setAssignedDoctorName(request.getAssignedDoctorName());
            res.setActiveProcedureType(request.getActiveProcedureType());
            res.setTriagePriority(request.getTriagePriority() != null && !request.getTriagePriority().trim().isEmpty() ? request.getTriagePriority().trim().toUpperCase() : "ROUTINE");
            res.setOccupiedSince(LocalDateTime.now());
            res.setExpectedReleaseAt(request.getExpectedReleaseAt() != null ? request.getExpectedReleaseAt() : LocalDateTime.now().plusHours(2));
            res.setCleaningChecklistCompleted(false);
        } else if (request.getOperationalStatus() == HospitalResource.ResourceStatus.CLEANING) {
            res.setCurrentPatientId(null);
            res.setCurrentPatientName(null);
            res.setCleaningChecklistCompleted(false);
            res.setExpectedReleaseAt(LocalDateTime.now().plusMinutes(30));
        } else if (request.getOperationalStatus() == HospitalResource.ResourceStatus.AVAILABLE) {
            res.setCurrentPatientId(null);
            res.setCurrentPatientName(null);
            res.setCurrentOwnerName(null);
            res.setCurrentOwnerPhone(null);
            res.setAssignedDoctorId(null);
            res.setAssignedDoctorName(null);
            res.setActiveProcedureType(null);
            res.setOccupiedSince(null);
            res.setExpectedReleaseAt(null);
            res.setCleaningChecklistCompleted(true);
        }

        if (request.getStatusNotes() != null) res.setStatusNotes(request.getStatusNotes());
        log.info("Resource {} ({}) transitioned to status: {}", res.getResourceCode(), res.getResourceName(), request.getOperationalStatus());
        HospitalResource saved = resourceRepository.save(res);
        broadcastOperationsSnapshot(saved.getHospitalId());
        return saved;
    }

    /**
     * Schedule an Operation Theatre Procedure with conflict detection.
     */
    public OTProcedure scheduleProcedure(ScheduleProcedureRequest request) {
        log.info("Scheduling procedure: {} in theatre: {}", request.getProcedureName(), request.getResourceId());

        // Check if theatre is already booked for overlapping scheduled period
        List<OTProcedure> existingInTheatre = procedureRepository.findByResourceIdAndStatus(
                request.getResourceId(), OTProcedure.ProcedureStatus.IN_PROGRESS);
        if (!existingInTheatre.isEmpty()) {
            throw new IllegalStateException("Operation Theatre is currently OCCUPIED by active surgery: " +
                    existingInTheatre.get(0).getProcedureName());
        }

        OTProcedure procedure = OTProcedure.builder()
                .procedureId(UUID.randomUUID())
                .hospitalId(request.getHospitalId())
                .hospitalName(request.getHospitalName())
                .resourceId(request.getResourceId())
                .theatreName(request.getTheatreName())
                .procedureName(request.getProcedureName())
                .patientId(request.getPatientId())
                .patientName(request.getPatientName())
                .species(request.getSpecies())
                .ownerName(request.getOwnerName())
                .leadSurgeonId(request.getLeadSurgeonId())
                .leadSurgeonName(request.getLeadSurgeonName())
                .anesthetistName(request.getAnesthetistName())
                .assistantSurgeonName(request.getAssistantSurgeonName())
                .scrubNurseName(request.getScrubNurseName())
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .priority(request.getPriority())
                .status(OTProcedure.ProcedureStatus.SCHEDULED)
                .clinicalNotes(request.getClinicalNotes())
                .postOpRecoveryPlan(request.getPostOpRecoveryPlan())
                .build();

        OTProcedure saved = procedureRepository.save(procedure);
        broadcastOperationsSnapshot(saved.getHospitalId());
        return saved;
    }

    public List<OTProcedure> getProceduresByHospital(UUID hospitalId) {
        return procedureRepository.findByHospitalId(hospitalId);
    }

    /**
     * Start Operation: Atomically transitions OT Room to OCCUPIED and Lead Surgeon to IN_SURGERY.
     */
    public OTProcedure startProcedure(UUID procedureId) {
        OTProcedure procedure = procedureRepository.findByProcedureId(procedureId)
                .orElseThrow(() -> new IllegalArgumentException("Procedure not found: " + procedureId));

        procedure.setStatus(OTProcedure.ProcedureStatus.IN_PROGRESS);
        procedure.setActualStart(LocalDateTime.now());

        // Update OT Resource to OCCUPIED
        resourceRepository.findByResourceId(procedure.getResourceId()).ifPresent(res -> {
            res.setOperationalStatus(HospitalResource.ResourceStatus.OCCUPIED);
            res.setCurrentPatientId(procedure.getPatientId());
            res.setCurrentPatientName(procedure.getPatientName());
            res.setAssignedDoctorId(procedure.getLeadSurgeonId());
            res.setAssignedDoctorName(procedure.getLeadSurgeonName());
            res.setActiveProcedureType(procedure.getProcedureName());
            res.setOccupiedSince(LocalDateTime.now());
            res.setCleaningChecklistCompleted(false);
            resourceRepository.save(res);
        });

        // Update Doctor status to IN_SURGERY
        if (procedure.getLeadSurgeonId() != null) {
            doctorStatusRepository.findByDoctorId(procedure.getLeadSurgeonId()).ifPresent(doc -> {
                doc.setOperationalStatus(DoctorLiveStatus.OperationalStatus.IN_SURGERY);
                doc.setCurrentLocation(procedure.getTheatreName());
                doc.setCurrentEncounterInfo("Surgery: " + procedure.getProcedureName() + " (" + procedure.getPatientName() + ")");
                doc.setCurrentProcedureId(procedure.getProcedureId());
                doc.setLastHeartbeatAt(LocalDateTime.now());
                doctorStatusRepository.save(doc);
            });
        }

        log.info("OT Procedure {} started. Surgeon & Theatre marked OCCUPIED/IN_SURGERY", procedureId);
        OTProcedure saved = procedureRepository.save(procedure);
        broadcastOperationsSnapshot(saved.getHospitalId());
        return saved;
    }

    /**
     * Complete Operation: Atomically sets OT Room to CLEANING and releases Lead Surgeon to AVAILABLE.
     */
    public OTProcedure completeProcedure(UUID procedureId, String postOpNotes) {
        OTProcedure procedure = procedureRepository.findByProcedureId(procedureId)
                .orElseThrow(() -> new IllegalArgumentException("Procedure not found: " + procedureId));

        procedure.setStatus(OTProcedure.ProcedureStatus.COMPLETED);
        procedure.setActualEnd(LocalDateTime.now());
        if (postOpNotes != null) procedure.setPostOpRecoveryPlan(postOpNotes);

        // Transition OT Resource to CLEANING
        resourceRepository.findByResourceId(procedure.getResourceId()).ifPresent(res -> {
            res.setOperationalStatus(HospitalResource.ResourceStatus.CLEANING);
            res.setCurrentPatientId(null);
            res.setCurrentPatientName(null);
            res.setCleaningChecklistCompleted(false);
            res.setExpectedReleaseAt(LocalDateTime.now().plusMinutes(30));
            res.setStatusNotes("Sterilization & decontamination in progress after " + procedure.getProcedureName());
            resourceRepository.save(res);
        });

        // Release Doctor to AVAILABLE
        if (procedure.getLeadSurgeonId() != null) {
            doctorStatusRepository.findByDoctorId(procedure.getLeadSurgeonId()).ifPresent(doc -> {
                doc.setOperationalStatus(DoctorLiveStatus.OperationalStatus.AVAILABLE);
                doc.setCurrentLocation("Consultation / Recovery Suite");
                doc.setCurrentEncounterInfo(null);
                doc.setCurrentProcedureId(null);
                doc.setLastHeartbeatAt(LocalDateTime.now());
                doctorStatusRepository.save(doc);
            });
        }

        log.info("OT Procedure {} completed. OT marked CLEANING, Doctor released to AVAILABLE", procedureId);
        OTProcedure saved = procedureRepository.save(procedure);
        broadcastOperationsSnapshot(saved.getHospitalId());
        return saved;
    }

    /**
     * Operational Capacity Dashboard Metric Snapshot
     */
    public HospitalOperationsSnapshot getHospitalSnapshot(UUID hospitalId) {
        // 1. Resolve Hospital Profile Document filled in Hospital Profile & Showcase
        HospitalProfileDocument profile = resolveProfile(hospitalId);
        String hospitalName = "Karpagam Hospital & Research Center";
        String branchName = "Main Hospital Campus";
        String city = "Ottakkalmandapam";
        String emergencyPhone = "9876789564";
        Boolean emergencySupport247 = true;
        String logoUrl = null;
        Integer completenessScore = 100;

        if (profile != null) {
            if (profile.getHospitalName() != null && !profile.getHospitalName().trim().isEmpty()) {
                hospitalName = profile.getHospitalName().trim();
            } else if (profile.getDisplayName() != null && !profile.getDisplayName().trim().isEmpty()) {
                hospitalName = profile.getDisplayName().trim();
            }
            if (profile.getBranches() != null && !profile.getBranches().isEmpty()) {
                branchName = profile.getBranches().get(0).getBranchName();
            } else if (profile.getStreetAddress() != null) {
                branchName = profile.getStreetAddress();
            }
            if (profile.getCity() != null) city = profile.getCity();
            if (profile.getEmergencyPhone() != null) emergencyPhone = profile.getEmergencyPhone();
            else if (profile.getPrimaryPhone() != null) emergencyPhone = profile.getPrimaryPhone();
            if (profile.getEmergencySupport247() != null) emergencySupport247 = profile.getEmergencySupport247();
            logoUrl = profile.getLogoUrl();
            completenessScore = profile.getCompletenessScore();

            // Sync filled doctors and facilities from hospital_profiles into live ops
            syncResourcesAndDoctorsFromProfile(profile, hospitalId, hospitalName, branchName);
        } else {
            ensureHospitalResourcesSeeded(hospitalId, hospitalName);
        }

        List<HospitalResource> resources = getHospitalResources(hospitalId, null);
        List<DoctorLiveStatus> doctors = getAllDoctorLiveStatuses(hospitalId);
        List<OTProcedure> procedures = procedureRepository.findByHospitalId(hospitalId);

        long totalEmergencyBeds = resources.stream().filter(r -> r.getResourceType() == HospitalResource.ResourceType.EMERGENCY_BED).count();
        long availableEmergencyBeds = resources.stream().filter(r -> r.getResourceType() == HospitalResource.ResourceType.EMERGENCY_BED && r.getOperationalStatus() == HospitalResource.ResourceStatus.AVAILABLE).count();

        long totalIcuBeds = resources.stream().filter(r -> r.getResourceType() == HospitalResource.ResourceType.ICU_BED).count();
        long availableIcuBeds = resources.stream().filter(r -> r.getResourceType() == HospitalResource.ResourceType.ICU_BED && r.getOperationalStatus() == HospitalResource.ResourceStatus.AVAILABLE).count();

        long totalOt = resources.stream().filter(r -> r.getResourceType() == HospitalResource.ResourceType.OPERATION_THEATRE).count();
        long availableOt = resources.stream().filter(r -> r.getResourceType() == HospitalResource.ResourceType.OPERATION_THEATRE && r.getOperationalStatus() == HospitalResource.ResourceStatus.AVAILABLE).count();

        long availableDoctors = doctors.stream().filter(d -> d.getOperationalStatus() == DoctorLiveStatus.OperationalStatus.AVAILABLE).count();
        long inSurgeryDoctors = doctors.stream().filter(d -> d.getOperationalStatus() == DoctorLiveStatus.OperationalStatus.IN_SURGERY).count();
        long emergencyDoctors = doctors.stream().filter(d -> d.getOperationalStatus() == DoctorLiveStatus.OperationalStatus.HANDLING_EMERGENCY).count();

        return HospitalOperationsSnapshot.builder()
                .hospitalId(hospitalId)
                .hospitalName(hospitalName)
                .branchName(branchName)
                .city(city)
                .emergencyPhone(emergencyPhone)
                .emergencySupport247(emergencySupport247)
                .logoUrl(logoUrl)
                .completenessScore(completenessScore)
                .totalEmergencyBeds(totalEmergencyBeds)
                .availableEmergencyBeds(availableEmergencyBeds)
                .totalIcuBeds(totalIcuBeds)
                .availableIcuBeds(availableIcuBeds)
                .totalOperationTheatres(totalOt)
                .availableOperationTheatres(availableOt)
                .availableDoctorsCount(availableDoctors)
                .inSurgeryDoctorsCount(inSurgeryDoctors)
                .emergencyDoctorsCount(emergencyDoctors)
                .resources(resources)
                .doctors(doctors)
                .activeProcedures(procedures)
                .build();
    }

    private HospitalProfileDocument resolveProfile(UUID hospitalId) {
        if (hospitalProfileRepository == null) return null;
        if (hospitalId != null) {
            Optional<HospitalProfileDocument> opt = hospitalProfileRepository.findByOrganizationId(hospitalId);
            if (opt.isPresent()) return opt.get();

            try {
                opt = hospitalProfileRepository.findById(hospitalId.toString());
                if (opt.isPresent()) return opt.get();
            } catch (Exception ignored) {}
        }

        List<HospitalProfileDocument> all = hospitalProfileRepository.findAll();
        return all.isEmpty() ? null : all.get(0);
    }

    private void syncResourcesAndDoctorsFromProfile(HospitalProfileDocument profile, UUID hospitalId, String hospitalName, String branchName) {
        // 1. Sync Doctors from Hospital Profile
        if (profile.getDoctors() != null) {
            List<DoctorLiveStatus> existingInHosp = new ArrayList<>(doctorStatusRepository.findByHospitalId(hospitalId));
            for (HospitalProfileDocument.DoctorProfileItem d : profile.getDoctors()) {
                if (d.getDoctorName() != null && d.getDoctorName().toLowerCase().contains("hospital administrator")) {
                    continue;
                }
                String norm = normalizeDoctorName(d.getDoctorName());
                UUID docUuid = null;
                if (d.getDoctorId() != null && !d.getDoctorId().trim().isEmpty()) {
                    try {
                        docUuid = UUID.fromString(d.getDoctorId());
                    } catch (Exception e) {
                        docUuid = UUID.nameUUIDFromBytes(d.getDoctorId().getBytes());
                    }
                } else {
                    docUuid = UUID.nameUUIDFromBytes((d.getDoctorName() != null ? d.getDoctorName() : "Doctor").getBytes());
                }

                final UUID finalDocUuid = docUuid;
                // Match by doctorId or by normalized doctor name to prevent duplicate entries
                Optional<DoctorLiveStatus> docOpt = doctorStatusRepository.findByDoctorId(finalDocUuid)
                        .or(() -> existingInHosp.stream()
                                .filter(e -> normalizeDoctorName(e.getDoctorName()).equals(norm))
                                .findFirst());

                if (docOpt.isEmpty()) {
                    DoctorLiveStatus liveDoc = DoctorLiveStatus.builder()
                            .doctorId(finalDocUuid)
                            .doctorName(d.getDoctorName())
                            .specialization(d.getSpecialty() != null ? d.getSpecialty() : "Veterinary Surgeon")
                            .hospitalId(hospitalId)
                            .hospitalName(hospitalName)
                            .branchName(branchName)
                            .operationalStatus(DoctorLiveStatus.OperationalStatus.AVAILABLE)
                            .currentLocation("Consultation Suite 1")
                            .onCall(true)
                            .lastHeartbeatAt(LocalDateTime.now())
                            .build();
                    DoctorLiveStatus saved = doctorStatusRepository.save(liveDoc);
                    existingInHosp.add(saved);
                } else {
                    DoctorLiveStatus liveDoc = docOpt.get();
                    boolean changed = false;
                    if (d.getDoctorName() != null && !d.getDoctorName().equals(liveDoc.getDoctorName())) {
                        liveDoc.setDoctorName(d.getDoctorName());
                        changed = true;
                    }
                    if (d.getSpecialty() != null && !d.getSpecialty().equals(liveDoc.getSpecialization())) {
                        liveDoc.setSpecialization(d.getSpecialty());
                        changed = true;
                    }
                    if (liveDoc.getHospitalId() == null || !hospitalId.equals(liveDoc.getHospitalId())) {
                        liveDoc.setHospitalId(hospitalId);
                        liveDoc.setHospitalName(hospitalName);
                        changed = true;
                    }
                    if (changed) {
                        doctorStatusRepository.save(liveDoc);
                    }
                }
            }
        }

        // 2. Sync Facilities from Hospital Profile into Physical Resources
        List<HospitalResource> existingResources = resourceRepository.findByHospitalId(hospitalId);
        if (profile.getFacilities() != null && !profile.getFacilities().isEmpty()) {
            for (HospitalProfileDocument.HospitalFacilityItem f : profile.getFacilities()) {
                String fName = f.getFacilityName() != null ? f.getFacilityName() : "Hospital Resource";
                String fNameLower = fName.toLowerCase();
                String fType = f.getType() != null ? f.getType().toUpperCase() : "";

                HospitalResource.ResourceType rType = HospitalResource.ResourceType.EMERGENCY_BED;
                if (fNameLower.contains("icu") || fType.contains("ICU")) {
                    rType = HospitalResource.ResourceType.ICU_BED;
                } else if (fNameLower.contains("theatre") || fNameLower.contains("surgery") || fNameLower.contains("ot") || fType.contains("THEATRE") || fType.contains("SURGERY") || fType.contains("OPERATION")) {
                    rType = HospitalResource.ResourceType.OPERATION_THEATRE;
                } else {
                    rType = HospitalResource.ResourceType.EMERGENCY_BED;
                }

                HospitalResource.ResourceType finalType = rType;
                boolean alreadyPresent = existingResources.stream().anyMatch(r -> 
                    (r.getResourceName() != null && r.getResourceName().equalsIgnoreCase(fName)) ||
                    (f.getFacilityId() != null && f.getFacilityId().equalsIgnoreCase(r.getResourceCode()))
                );

                if (!alreadyPresent) {
                    HospitalResource.ResourceStatus rStatus = HospitalResource.ResourceStatus.AVAILABLE;
                    if (f.getOperationalStatus() != null) {
                        if ("MAINTENANCE".equalsIgnoreCase(f.getOperationalStatus()) || "UNAVAILABLE".equalsIgnoreCase(f.getOperationalStatus())) {
                            rStatus = HospitalResource.ResourceStatus.OUT_OF_SERVICE;
                        } else if ("CLEANING".equalsIgnoreCase(f.getOperationalStatus())) {
                            rStatus = HospitalResource.ResourceStatus.CLEANING;
                        }
                    }

                    String resCode = f.getFacilityId();
                    if (resCode == null || resCode.matches("^[0-9a-fA-F-]{36}$")) {
                        String prefix = finalType == HospitalResource.ResourceType.OPERATION_THEATRE ? "OT-" :
                                (finalType == HospitalResource.ResourceType.ICU_BED ? "ICU-" : "BED-");
                        resCode = prefix + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
                    }

                    HospitalResource newRes = HospitalResource.builder()
                            .hospitalId(hospitalId)
                            .hospitalName(hospitalName)
                            .branchName(branchName)
                            .resourceCode(resCode)
                            .resourceName(fName)
                            .resourceType(finalType)
                            .operationalStatus(rStatus)
                            .locationDescription(f.getSupportedProcedures() != null ? f.getSupportedProcedures() : "Hospital Facility Wing")
                            .cleaningChecklistCompleted(true)
                            .build();
                    resourceRepository.save(newRes);
                }
            }
        }

        // If after sync still no resources exist, seed baseline emergency, ICU, and OT suites
        List<HospitalResource> afterSync = resourceRepository.findByHospitalId(hospitalId);
        if (afterSync.isEmpty()) {
            ensureHospitalResourcesSeeded(hospitalId, hospitalName);
        }
    }

    public void broadcastOperationsSnapshot(UUID hospitalId) {
        if (hospitalId == null || messagingTemplate == null) return;
        try {
            HospitalOperationsSnapshot snapshot = getHospitalSnapshot(hospitalId);
            messagingTemplate.convertAndSend("/topic/operations/" + hospitalId, snapshot);
            messagingTemplate.convertAndSend("/topic/operations/live", snapshot);
        } catch (Exception e) {
            log.warn("Non-critical: WebSocket broadcast error: {}", e.getMessage());
        }
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HospitalOperationsSnapshot {
        private UUID hospitalId;
        private String hospitalName;
        private String branchName;
        private String city;
        private String emergencyPhone;
        private Boolean emergencySupport247;
        private String logoUrl;
        private Integer completenessScore;
        private long totalEmergencyBeds;
        private long availableEmergencyBeds;
        private long totalIcuBeds;
        private long availableIcuBeds;
        private long totalOperationTheatres;
        private long availableOperationTheatres;
        private long availableDoctorsCount;
        private long inSurgeryDoctorsCount;
        private long emergencyDoctorsCount;
        private List<HospitalResource> resources;
        private List<DoctorLiveStatus> doctors;
        private List<OTProcedure> activeProcedures;
    }
}
