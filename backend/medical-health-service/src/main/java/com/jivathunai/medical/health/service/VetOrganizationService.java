package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.InviteStaffRequest;
import com.jivathunai.medical.health.dto.RegisterOrganizationRequest;
import com.jivathunai.medical.health.entity.mongo.HospitalFacilityProfile;
import com.jivathunai.medical.health.entity.mysql.VetOrganization;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.exception.ResourceNotFoundException;
import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument;
import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument.HospitalBranch;
import com.jivathunai.medical.health.repository.mongo.HospitalProfileRepository;
import com.jivathunai.medical.health.repository.mongo.HospitalFacilityProfileRepository;
import com.jivathunai.medical.health.repository.mysql.VetOrganizationRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VetOrganizationService {

    private final VetOrganizationRepository orgRepository;
    private final HospitalFacilityProfileRepository facilityProfileRepository;
    private final VetStaffRegistryRepository staffRegistryRepository;
    private final HospitalProfileRepository hospitalProfileRepository;

    /**
     * Complete Organization Self-Onboarding Pipeline:
     * Persists Corporate & KYC ledger into MySQL, and Geospatial/Facility Amenities into MongoDB.
     */
    @Transactional
    public Map<String, Object> registerOrganization(RegisterOrganizationRequest request) {
        log.info("🏥 [ORG_ONBOARDING] Registering new veterinary hospital: {}", request.registeredBusinessName());

        // 1. Persist Transactional & Legal Account in MySQL
        VetOrganization organization = VetOrganization.builder()
                .registeredBusinessName(request.registeredBusinessName())
                .gstin(request.gstin())
                .corporatePan(request.corporatePan())
                .clinicalEstablishmentActRegNumber(request.clinicalEstablishmentActRegNumber())
                .emergencySupport247(request.emergencySupport247() != null ? request.emergencySupport247() : false)
                .primaryContactMobile(request.primaryContactMobile())
                .billingEmailAddress(request.billingEmailAddress())
                .address(request.streetAddress())
                .city(request.city())
                .kycStatus(VetOrganization.KycStatus.PENDING_VERIFICATION)
                .build();

        VetOrganization savedOrg = orgRepository.save(organization);
        UUID orgId = savedOrg.getOrganizationId();

        // 2. Persist Geospatial & Infrastructure Amenities in MongoDB
        HospitalFacilityProfile.Address address = HospitalFacilityProfile.Address.builder()
                .streetAddress(request.streetAddress())
                .city(request.city())
                .district(request.district())
                .stateName(request.stateName())
                .country(request.country())
                .pinCode(request.pinCode())
                .googleMapLink(request.googleMapLink())
                .build();

        HospitalFacilityProfile.InfrastructureChecklist checklist = HospitalFacilityProfile.InfrastructureChecklist.builder()
                .inHousePharmacy(request.inHousePharmacy())
                .icu(request.icu())
                .xRayUnit(request.xRayUnit())
                .pathologyLab(request.pathologyLab())
                .bloodBank(request.bloodBank())
                .otherAmenities(request.otherAmenities() != null ? request.otherAmenities() : new ArrayList<>())
                .build();

        HospitalFacilityProfile facilityProfile = HospitalFacilityProfile.builder()
                .organizationId(orgId)
                .addressGeospatial(address)
                .facilityMedia(new ArrayList<>())
                .infrastructureChecklist(checklist)
                .verificationLogs(List.of("Self-onboarded via Platform Portal. Status: PENDING_VERIFICATION"))
                .build();

        facilityProfileRepository.save(facilityProfile);

        // 3. Persist Hospital Management Showcase Profile with Main Branch in MongoDB
        HospitalBranch mainBranch = HospitalBranch.builder()
                .branchId(UUID.randomUUID().toString())
                .branchName(savedOrg.getRegisteredBusinessName() + " - Main Campus")
                .isMainBranch(true)
                .streetAddress(request.streetAddress())
                .city(request.city())
                .district(request.district())
                .stateName(request.stateName())
                .country(request.country() != null && !request.country().isBlank() ? request.country() : "India")
                .pinCode(request.pinCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .googleMapLink(request.googleMapLink())
                .directionsAndLandmarks(request.directionsAndLandmarks())
                .phone(request.primaryContactMobile())
                .email(request.billingEmailAddress())
                .locationVerificationStatus("PENDING")
                .locationEvidenceList(new ArrayList<>())
                .build();

        String rawSlug = savedOrg.getRegisteredBusinessName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        String slug = rawSlug.isBlank() ? "vet-hospital-" + UUID.randomUUID().toString().substring(0, 8) : rawSlug;

        HospitalProfileDocument hospitalProfile = HospitalProfileDocument.builder()
                .organizationId(orgId)
                .slug(slug)
                .hospitalName(savedOrg.getRegisteredBusinessName())
                .displayName(savedOrg.getRegisteredBusinessName())
                .hospitalType("VETERINARY_HOSPITAL")
                .streetAddress(request.streetAddress())
                .city(request.city())
                .district(request.district())
                .stateName(request.stateName())
                .country(request.country() != null && !request.country().isBlank() ? request.country() : "India")
                .pinCode(request.pinCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .googleMapLink(request.googleMapLink())
                .directionsAndLandmarks(request.directionsAndLandmarks())
                .primaryPhone(request.primaryContactMobile())
                .billingEmail(request.billingEmailAddress())
                .publicEmail(request.billingEmailAddress())
                .emergencySupport247(Boolean.TRUE.equals(request.emergencySupport247()))
                .clinicalEstablishmentRegNumber(request.clinicalEstablishmentActRegNumber())
                .gstin(request.gstin())
                .corporatePan(request.corporatePan())
                .branches(List.of(mainBranch))
                .status(HospitalProfileDocument.ProfileStatus.DRAFT)
                .completenessScore(50)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        hospitalProfileRepository.save(hospitalProfile);
        log.info("✅ Hospital Profile & Main Branch successfully initialized in MongoDB. Org ID: {}", orgId);

        return Map.of(
                "organizationId", orgId,
                "businessName", savedOrg.getRegisteredBusinessName(),
                "status", savedOrg.getKycStatus().name(),
                "message", "Tenant registered successfully with Main Branch. Waiting for platform KYC approval."
        );
    }

    /**
     * Staff Provisioning & Invite Engine:
     * Links invited practitioner or support staff to the parent hospital organization.
     */
    @Transactional
    public Map<String, Object> inviteStaff(UUID orgId, InviteStaffRequest request) {
        log.info("👨‍⚕️ [STAFF_PROVISIONING] Inviting {} with role {} to Hospital Org ID: {}",
                request.email(), request.role(), orgId);

        VetOrganization organization = orgRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital Organization not found with ID: " + orgId));

        UUID newStaffUserId = UUID.randomUUID();
        String inviteToken = "INV-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase();

        VetStaffRegistry staffRegistry = VetStaffRegistry.builder()
                .userId(newStaffUserId)
                .parentOrganization(organization)
                .assignedSystemRole(request.role())
                .doctorName(request.fullName())
                .employmentStatus(VetStaffRegistry.EmploymentStatus.ACTIVE)
                .vciRegistrationNumber(request.role() == VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR ? "VCI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() : null)
                .specialization(request.role() == VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR ? "Veterinary Clinical Specialist" : "Support Staff")
                .build();

        staffRegistryRepository.save(staffRegistry);
        log.info("✅ Staff member provisioned into VetStaffRegistry with User ID: {}", newStaffUserId);

        return Map.of(
                "userId", newStaffUserId,
                "email", request.email(),
                "fullName", request.fullName(),
                "role", request.role().name(),
                "hospitalId", orgId,
                "hospitalName", organization.getRegisteredBusinessName(),
                "inviteToken", inviteToken,
                "status", "ACTIVE"
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrganizationDetails(UUID orgId) {
        VetOrganization org = orgRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital Organization not found with ID: " + orgId));

        Optional<HospitalFacilityProfile> profileOpt = facilityProfileRepository.findByOrganizationId(orgId);

        Map<String, Object> result = new HashMap<>();
        result.put("organizationId", org.getOrganizationId());
        result.put("registeredBusinessName", org.getRegisteredBusinessName());
        result.put("gstin", org.getGstin());
        result.put("corporatePan", org.getCorporatePan());
        result.put("clinicalEstablishmentActRegNumber", org.getClinicalEstablishmentActRegNumber());
        result.put("emergencySupport247", org.getEmergencySupport247());
        result.put("primaryContactMobile", org.getPrimaryContactMobile());
        result.put("billingEmailAddress", org.getBillingEmailAddress());
        result.put("kycStatus", org.getKycStatus().name());
        result.put("address", org.getAddress());
        result.put("city", org.getCity());

        profileOpt.ifPresent(p -> {
            result.put("facilityProfile", p);
            result.put("infrastructureChecklist", p.getInfrastructureChecklist());
            result.put("addressGeospatial", p.getAddressGeospatial());
        });

        return result;
    }

    @Transactional(readOnly = true)
    public List<VetStaffRegistry> getStaffByOrganization(UUID orgId) {
        return staffRegistryRepository.findByParentOrganization_OrganizationId(orgId);
    }

    @Transactional
    public void removeStaff(UUID orgId, UUID staffUserId) {
        log.info("Removing staff member {} from Org {}", staffUserId, orgId);
        staffRegistryRepository.findByUserId(staffUserId).ifPresent(staff -> {
            if (staff.getParentOrganization() != null && orgId.equals(staff.getParentOrganization().getOrganizationId())) {
                staffRegistryRepository.delete(staff);
            }
        });
    }

    @Transactional
    public VetOrganization updateKycStatus(UUID orgId, VetOrganization.KycStatus status) {
        VetOrganization org = orgRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital Organization not found with ID: " + orgId));
        org.setKycStatus(status);
        return orgRepository.save(org);
    }
}
