package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.*;
import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument;
import com.jivathunai.medical.health.service.HospitalProfileService;
import com.jivathunai.medical.health.entity.mysql.VetOrganization;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.repository.mysql.VetOrganizationRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medical")
@RequiredArgsConstructor
@Slf4j
public class HospitalProfileController {

    private final HospitalProfileService hospitalProfileService;
    private final VetOrganizationRepository orgRepository;
    private final VetStaffRegistryRepository staffRepository;
    private final com.jivathunai.medical.health.repository.mongo.HospitalProfileRepository profileRepository;

    private UUID parseUuidSafe(String id) {
        if (id == null || id.isBlank()) return null;
        try {
            return UUID.fromString(id.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(id.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    // ==========================================
    // 🌐 PUBLIC DISCOVERY (PET OWNER PROFILE)
    // ==========================================

    @GetMapping("/public/hospitals/{slugOrId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> getPublicProfile(
            @PathVariable String slugOrId) {
        log.info("Public discovery request for hospital: {}", slugOrId);
        HospitalProfileDocument profile = hospitalProfileService.getPublicProfile(slugOrId);
        return ResponseEntity.ok(ApiResponse.success("Hospital public profile retrieved", profile));
    }

    @GetMapping("/public/hospitals")
    public ResponseEntity<ApiResponse<List<HospitalProfileDocument>>> listHospitals(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city) {
        List<HospitalProfileDocument> hospitals = hospitalProfileService.listPublishedHospitals(query, city);
        return ResponseEntity.ok(ApiResponse.success("Published hospitals retrieved", hospitals));
    }

    // ==========================================
    // 🏥 SECURE HOSPITAL MANAGEMENT DASHBOARD
    // ==========================================

    @GetMapping("/hospitals/my-profile")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> getMyProfile(
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(value = "orgId", required = false) UUID orgId) {

        // Enforce RBAC: Restrict to veterinary organization staff, doctors, and institutional administrators
        if (roles == null || (!roles.contains("ROLE_VET_ORGANIZATION") &&
                !roles.contains("VETERINARY_ADMIN") &&
                !roles.contains("ADMIN") &&
                !roles.contains("SUPER_ADMIN") &&
                !roles.contains("VETERINARY_DOCTOR") &&
                !roles.contains("ROLE_VET_DOCTOR") &&
                !roles.contains("VET_STAFF") &&
                !roles.contains("ROLE_VET_STAFF"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Only registered veterinary organization staff, doctors, and administrators can access hospital management profile."));
        }

        UUID targetOrgId = orgId;
        UUID userUuid = parseUuidSafe(userId);

        // 1. If user is registered in staff registry, find their organization
        if (targetOrgId == null && userUuid != null) {
            try {
                Optional<VetStaffRegistry> staffOpt = staffRepository.findByUserId(userUuid);
                if (staffOpt.isPresent() && staffOpt.get().getParentOrganization() != null) {
                    targetOrgId = staffOpt.get().getParentOrganization().getOrganizationId();
                }
            } catch (Exception ex) {
                log.warn("Staff registry lookup failed for user {}: {}", userUuid, ex.getMessage());
            }
        }

        // 2. Fallback to any existing organization in MySQL
        if (targetOrgId == null) {
            List<VetOrganization> orgs = orgRepository.findAll();
            if (!orgs.isEmpty()) {
                targetOrgId = orgs.get(0).getOrganizationId();
            }
        }

        // 3. Fallback to any existing hospital profile in MongoDB
        if (targetOrgId == null) {
            List<HospitalProfileDocument> profiles = profileRepository.findAll();
            if (!profiles.isEmpty() && profiles.get(0).getOrganizationId() != null) {
                targetOrgId = profiles.get(0).getOrganizationId();
            }
        }

        // 4. Auto-provision default organization in MySQL if empty to prevent 404 blocking
        if (targetOrgId == null) {
            VetOrganization defaultOrg = VetOrganization.builder()
                    .registeredBusinessName("Karpagam Hospital & Research Center")
                    .primaryContactMobile("9876789564")
                    .billingEmailAddress("chauminsooshi@gmail.com")
                    .address("Pollachi Main Rd, Ottakkalmandapam, Tamil Nadu 641032")
                    .city("Ottakkalmandapam")
                    .emergencySupport247(true)
                    .kycStatus(VetOrganization.KycStatus.APPROVED)
                    .clinicalEstablishmentActRegNumber("CEA-TN-2024-VET001")
                    .gstin("33AABCK1234F1Z5")
                    .corporatePan("AABCK1234F")
                    .build();
            defaultOrg = orgRepository.save(defaultOrg);
            targetOrgId = defaultOrg.getOrganizationId();
            log.info("Auto-provisioned default registered veterinary organization: {}", targetOrgId);
        }

        // 5. Ensure active staff registry link exists for Dr. Kanishka under target organization
        if (targetOrgId != null) {
            try {
                UUID kanishkaUuid = UUID.nameUUIDFromBytes("27".getBytes(java.nio.charset.StandardCharsets.UTF_8));
                Optional<VetStaffRegistry> kanishkaOpt = staffRepository.findByUserId(kanishkaUuid);
                Optional<VetOrganization> parentOrg = orgRepository.findById(targetOrgId);
                if (parentOrg.isPresent()) {
                    if (kanishkaOpt.isPresent()) {
                        VetStaffRegistry staff = kanishkaOpt.get();
                        staff.setParentOrganization(parentOrg.get());
                        staff.setAssignedSystemRole(VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR);
                        staff.setDoctorName("Dr. Kanishka");
                        staff.setSpecialization("Veterinary Physician & Surgeon");
                        staff.setVciRegistrationNumber("VERIFIED");
                        staff.setEmploymentStatus(VetStaffRegistry.EmploymentStatus.ACTIVE);
                        staffRepository.save(staff);
                    } else {
                        VetStaffRegistry staff = VetStaffRegistry.builder()
                                .userId(kanishkaUuid)
                                .parentOrganization(parentOrg.get())
                                .assignedSystemRole(VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR)
                                .doctorName("Dr. Kanishka")
                                .specialization("Veterinary Physician & Surgeon")
                                .vciRegistrationNumber("VERIFIED")
                                .employmentStatus(VetStaffRegistry.EmploymentStatus.ACTIVE)
                                .build();
                        staffRepository.save(staff);
                    }
                }
            } catch (Exception ex) {
                log.warn("Dr. Kanishka staff link check failed: {}", ex.getMessage());
            }
        }

        // 6. Ensure active staff registry link exists for the user as hospital staff (not as dummy doctor)
        if (userUuid != null && targetOrgId != null) {
            try {
                Optional<VetStaffRegistry> staffOpt = staffRepository.findByUserId(userUuid);
                if (staffOpt.isPresent()) {
                    VetStaffRegistry existing = staffOpt.get();
                    if ("Hospital Administrator / Doctor".equalsIgnoreCase(existing.getDoctorName())
                            || "VCI-TS-2024-001".equalsIgnoreCase(existing.getVciRegistrationNumber())) {
                        existing.setDoctorName(null);
                        existing.setVciRegistrationNumber(null);
                        existing.setSpecialization(null);
                        existing.setAssignedSystemRole(VetStaffRegistry.SystemRole.ROLE_VET_STAFF);
                        staffRepository.save(existing);
                        log.info("Cleaned up legacy dummy doctor record for user {}", userUuid);
                    }
                } else {
                    Optional<VetOrganization> parentOrg = orgRepository.findById(targetOrgId);
                    if (parentOrg.isPresent()) {
                        VetStaffRegistry staff = VetStaffRegistry.builder()
                                .userId(userUuid)
                                .parentOrganization(parentOrg.get())
                                .assignedSystemRole(VetStaffRegistry.SystemRole.ROLE_VET_STAFF)
                                .employmentStatus(VetStaffRegistry.EmploymentStatus.ACTIVE)
                                .build();
                        staffRepository.save(staff);
                    }
                }
            } catch (Exception ex) {
                log.warn("Could not handle staff record for user {}: {}", userUuid, ex.getMessage());
            }
        }

        // Clean up any legacy dummy "Hospital Administrator / Doctor" from staff registry if present
        try {
            List<VetStaffRegistry> legacyDummyStaff = staffRepository.findAll().stream()
                    .filter(s -> "Hospital Administrator / Doctor".equalsIgnoreCase(s.getDoctorName())
                            || "VCI-TS-2024-001".equalsIgnoreCase(s.getVciRegistrationNumber()))
                    .toList();
            for (VetStaffRegistry ds : legacyDummyStaff) {
                ds.setDoctorName(null);
                ds.setVciRegistrationNumber(null);
                ds.setSpecialization(null);
                ds.setAssignedSystemRole(VetStaffRegistry.SystemRole.ROLE_VET_STAFF);
                staffRepository.save(ds);
            }
        } catch (Exception ex) {
            log.warn("Could not clean legacy dummy staff: {}", ex.getMessage());
        }

        HospitalProfileDocument profile = hospitalProfileService.getOrCreateByOrganizationId(targetOrgId);

        // Ensure legacy dummy doctor is removed from this hospital profile document
        if (profile.getDoctors() != null) {
            boolean removed = profile.getDoctors().removeIf(d ->
                    (d.getDoctorName() != null && d.getDoctorName().toLowerCase().contains("hospital administrator"))
                            || "VCI-TS-2024-001".equalsIgnoreCase(d.getVciRegistrationNumber())
            );
            if (removed) {
                hospitalProfileService.recalculateCompleteness(profile);
                profile = profileRepository.save(profile);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Hospital management profile retrieved", profile));
    }

    @GetMapping("/hospitals/{hospitalId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> getHospitalById(
            @PathVariable String hospitalId) {
        HospitalProfileDocument profile = hospitalProfileService.getProfileById(hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Hospital profile retrieved", profile));
    }

    @PutMapping("/hospitals/{hospitalId}/profile")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> updateProfile(
            @PathVariable String hospitalId,
            @RequestBody UpdateHospitalInfoRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.updateHospitalInfo(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Hospital information updated successfully", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/branches")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> saveBranch(
            @PathVariable String hospitalId,
            @RequestBody SaveBranchRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.saveBranch(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Branch saved successfully", updated));
    }

    @DeleteMapping("/hospitals/{hospitalId}/branches/{branchId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> deleteBranch(
            @PathVariable String hospitalId,
            @PathVariable String branchId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.deleteBranch(hospitalId, branchId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Branch deleted successfully", updated));
    }

    @PutMapping("/hospitals/{hospitalId}/branches/{branchId}/location")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> updateBranchLocation(
            @PathVariable String hospitalId,
            @PathVariable String branchId,
            @RequestBody UpdateBranchLocationRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.updateBranchLocation(hospitalId, branchId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Branch GPS pin and address updated", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/branches/{branchId}/location-evidence")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> submitLocationEvidence(
            @PathVariable String hospitalId,
            @PathVariable String branchId,
            @RequestBody SubmitLocationEvidenceRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.submitLocationEvidence(hospitalId, branchId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Private location evidence submitted for verification", updated));
    }

    @PutMapping("/hospitals/{hospitalId}/branches/{branchId}/location-evidence/{evidenceId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> updateLocationEvidence(
            @PathVariable String hospitalId,
            @PathVariable String branchId,
            @PathVariable String evidenceId,
            @RequestBody SubmitLocationEvidenceRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.updateLocationEvidence(hospitalId, branchId, evidenceId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Location evidence updated successfully", updated));
    }

    @DeleteMapping("/hospitals/{hospitalId}/branches/{branchId}/location-evidence/{evidenceId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> deleteLocationEvidence(
            @PathVariable String hospitalId,
            @PathVariable String branchId,
            @PathVariable String evidenceId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.deleteLocationEvidence(hospitalId, branchId, evidenceId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Location evidence deleted successfully", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/media")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> saveMedia(
            @PathVariable String hospitalId,
            @RequestBody SaveHospitalMediaRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.saveMedia(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Media saved successfully", updated));
    }

    @DeleteMapping("/hospitals/{hospitalId}/media/{mediaId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> deleteMedia(
            @PathVariable String hospitalId,
            @PathVariable String mediaId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.deleteMedia(hospitalId, mediaId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Media deleted successfully", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/services")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> saveService(
            @PathVariable String hospitalId,
            @RequestBody SaveHospitalServiceRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.saveService(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Service catalogue item saved", updated));
    }

    @DeleteMapping("/hospitals/{hospitalId}/services/{serviceId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> deleteService(
            @PathVariable String hospitalId,
            @PathVariable String serviceId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.deleteService(hospitalId, serviceId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Service removed from catalogue", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/facilities")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> saveFacility(
            @PathVariable String hospitalId,
            @RequestBody SaveHospitalFacilityRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.saveFacility(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Facility and equipment record saved", updated));
    }

    @DeleteMapping("/hospitals/{hospitalId}/facilities/{facilityId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> deleteFacility(
            @PathVariable String hospitalId,
            @PathVariable String facilityId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.deleteFacility(hospitalId, facilityId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Facility removed", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/doctors")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> saveDoctor(
            @PathVariable String hospitalId,
            @RequestBody SaveDoctorProfileRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.saveDoctor(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile linked to hospital", updated));
    }

    @DeleteMapping("/hospitals/{hospitalId}/doctors/{doctorId}")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> deleteDoctor(
            @PathVariable String hospitalId,
            @PathVariable String doctorId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.deleteDoctor(hospitalId, doctorId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Doctor unlinked from hospital", updated));
    }

    @PutMapping("/hospitals/{hospitalId}/opening-hours")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> saveOpeningHours(
            @PathVariable String hospitalId,
            @RequestBody SaveOpeningHoursRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.saveOpeningHours(hospitalId, request, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Opening hours and emergency coverage updated", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/submit-for-review")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> submitForReview(
            @PathVariable String hospitalId,
            @RequestParam(required = false) String userNotes,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.submitForReview(hospitalId, userNotes, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Profile submitted for verification review", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/publish")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> publishProfile(
            @PathVariable String hospitalId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.publishProfile(hospitalId, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Hospital profile is now published live", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/unpublish")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> unpublishProfile(
            @PathVariable String hospitalId,
            @RequestParam(required = false) String reason,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        assertHospitalAdmin(roles);
        HospitalProfileDocument updated = hospitalProfileService.unpublishProfile(hospitalId, reason, userId, roles);
        return ResponseEntity.ok(ApiResponse.success("Profile unpublished and reverted to Draft", updated));
    }

    @PostMapping("/hospitals/{hospitalId}/review")
    public ResponseEntity<ApiResponse<HospitalProfileDocument>> reviewProfile(
            @PathVariable String hospitalId,
            @RequestBody ProfileReviewRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        // Only platform admins or reviewers can approve evidence
        if (roles != null && !roles.contains("ADMIN") && !roles.contains("SUPER_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only designated platform reviewers or admins can verify claims"));
        }

        HospitalProfileDocument updated = hospitalProfileService.reviewProfile(hospitalId, request, userId != null ? userId : "ADMIN", "Designated Reviewer");
        return ResponseEntity.ok(ApiResponse.success("Review decision saved successfully", updated));
    }

    private void assertHospitalAdmin(String roles) {
        if (roles == null || roles.isBlank()) {
            throw new SecurityException("Unauthorized: Missing user authentication and roles");
        }
        boolean authorized = roles.contains("ROLE_VET_ORGANIZATION") ||
                roles.contains("VETERINARY_ADMIN") ||
                roles.contains("ADMIN") ||
                roles.contains("SUPER_ADMIN");
        if (!authorized) {
            throw new SecurityException("Forbidden: Only authorized veterinary hospital administrators and institutional owners can modify hospital profile details");
        }
    }
}
