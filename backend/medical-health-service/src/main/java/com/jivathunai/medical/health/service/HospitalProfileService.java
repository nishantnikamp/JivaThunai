package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.*;
import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument;
import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument.*;
import com.jivathunai.medical.health.entity.mysql.VetOrganization;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.exception.ResourceNotFoundException;
import com.jivathunai.medical.health.repository.mongo.HospitalProfileRepository;
import com.jivathunai.medical.health.repository.mysql.VetOrganizationRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalProfileService {

    private final HospitalProfileRepository profileRepository;
    private final VetOrganizationRepository organizationRepository;
    private final VetStaffRegistryRepository staffRepository;

    /**
     * Get or create a hospital profile by organizationId
     */
    public HospitalProfileDocument getOrCreateByOrganizationId(UUID organizationId) {
        HospitalProfileDocument doc = profileRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> bootstrapFromOrganization(organizationId));
        return syncHospitalMainBranchAndStaff(doc);
    }

    /**
     * Get hospital profile by ID (Owner/Admin complete view)
     */
    public HospitalProfileDocument getProfileById(String id) {
        HospitalProfileDocument doc = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found for ID: " + id));
        return syncHospitalMainBranchAndStaff(doc);
    }

    /**
     * Ensure main branch is present in branches list and active doctors from staff registry are synchronized
     */
    public HospitalProfileDocument syncHospitalMainBranchAndStaff(HospitalProfileDocument doc) {
        if (doc == null) return null;
        boolean modified = false;

        if (doc.getBranches() == null) {
            doc.setBranches(new ArrayList<>());
            modified = true;
        }

        if (doc.getBranches().isEmpty()) {
            HospitalBranch mainBranch = HospitalBranch.builder()
                    .branchId(UUID.randomUUID().toString())
                    .branchName(doc.getDisplayName() != null && !doc.getDisplayName().isBlank() ? doc.getDisplayName() + " - Main Campus" : "Main Hospital Campus")
                    .isMainBranch(true)
                    .streetAddress(doc.getStreetAddress())
                    .city(doc.getCity())
                    .district(doc.getDistrict())
                    .stateName(doc.getStateName())
                    .country(doc.getCountry() != null ? doc.getCountry() : "India")
                    .pinCode(doc.getPinCode())
                    .latitude(doc.getLatitude())
                    .longitude(doc.getLongitude())
                    .googleMapLink(doc.getGoogleMapLink())
                    .directionsAndLandmarks(doc.getDirectionsAndLandmarks())
                    .phone(doc.getPrimaryPhone())
                    .email(doc.getPublicEmail())
                    .locationVerificationStatus("PENDING")
                    .locationEvidenceList(new ArrayList<>())
                    .build();
            doc.getBranches().add(mainBranch);
            modified = true;
        } else {
            HospitalBranch main = doc.getBranches().stream()
                    .filter(b -> Boolean.TRUE.equals(b.getIsMainBranch()))
                    .findFirst()
                    .orElse(doc.getBranches().get(0));

            if (main.getStreetAddress() == null && doc.getStreetAddress() != null) {
                main.setStreetAddress(doc.getStreetAddress());
                modified = true;
            }
            if (main.getCity() == null && doc.getCity() != null) {
                main.setCity(doc.getCity());
                modified = true;
            }
            if (main.getDistrict() == null && doc.getDistrict() != null) {
                main.setDistrict(doc.getDistrict());
                modified = true;
            }
            if (main.getStateName() == null && doc.getStateName() != null) {
                main.setStateName(doc.getStateName());
                modified = true;
            }
            if (main.getCountry() == null && doc.getCountry() != null) {
                main.setCountry(doc.getCountry());
                modified = true;
            }
            if (main.getPinCode() == null && doc.getPinCode() != null) {
                main.setPinCode(doc.getPinCode());
                modified = true;
            }
            if (main.getLatitude() == null && doc.getLatitude() != null) {
                main.setLatitude(doc.getLatitude());
                modified = true;
            }
            if (main.getLongitude() == null && doc.getLongitude() != null) {
                main.setLongitude(doc.getLongitude());
                modified = true;
            }
            if (main.getGoogleMapLink() == null && doc.getGoogleMapLink() != null) {
                main.setGoogleMapLink(doc.getGoogleMapLink());
                modified = true;
            }
            if (main.getDirectionsAndLandmarks() == null && doc.getDirectionsAndLandmarks() != null) {
                main.setDirectionsAndLandmarks(doc.getDirectionsAndLandmarks());
                modified = true;
            }
        }

        // Purge any legacy dummy "Hospital Administrator / Doctor" from doctors list
        if (doc.getDoctors() != null) {
            boolean removed = doc.getDoctors().removeIf(d ->
                    (d.getDoctorName() != null && d.getDoctorName().toLowerCase().contains("hospital administrator"))
                            || "VCI-TS-2024-001".equalsIgnoreCase(d.getVciRegistrationNumber())
            );
            if (removed) {
                modified = true;
            }
        }

        // Synchronize real registered doctors from MySQL staff repository into hospital profile document
        if (doc.getOrganizationId() != null) {
            try {
                List<VetStaffRegistry> staffList = staffRepository.findByParentOrganization_OrganizationId(doc.getOrganizationId());
                if (staffList != null && !staffList.isEmpty()) {
                    List<DoctorProfileItem> currentDocs = doc.getDoctors() != null ? new ArrayList<>(doc.getDoctors()) : new ArrayList<>();
                    Set<String> existingNames = new HashSet<>();
                    for (DoctorProfileItem d : currentDocs) {
                        if (d.getDoctorName() != null) {
                            existingNames.add(d.getDoctorName().toLowerCase().trim());
                        }
                    }

                    for (VetStaffRegistry staff : staffList) {
                        if (staff.getAssignedSystemRole() == VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR
                                && staff.getEmploymentStatus() == VetStaffRegistry.EmploymentStatus.ACTIVE) {
                            String name = staff.getDoctorName() != null ? staff.getDoctorName() : "Doctor";
                            // Skip dummy admin doctor
                            if (name.toLowerCase().contains("hospital administrator")
                                    || "VCI-TS-2024-001".equalsIgnoreCase(staff.getVciRegistrationNumber())) {
                                continue;
                            }
                            if (!existingNames.contains(name.toLowerCase().trim())) {
                                currentDocs.add(DoctorProfileItem.builder()
                                        .doctorId(staff.getUserId().toString())
                                        .doctorName(name)
                                        .specialty(staff.getSpecialization() != null ? staff.getSpecialization() : "Veterinary Surgeon & Physician")
                                        .vciRegistrationNumber(staff.getVciRegistrationNumber() != null ? staff.getVciRegistrationNumber() : "Verified")
                                        .verificationStatus("VERIFIED")
                                        .languages(List.of("English", "Hindi"))
                                        .speciesTreated(List.of("Dogs", "Cats"))
                                        .build());
                                existingNames.add(name.toLowerCase().trim());
                                modified = true;
                            }
                        }
                    }
                    doc.setDoctors(currentDocs);
                }
            } catch (Exception ex) {
                log.warn("Could not sync staff doctors: {}", ex.getMessage());
            }
        }

        // Guarantee Dr. Kanishka is enrolled in doctors list
        List<DoctorProfileItem> checkDocs = doc.getDoctors() != null ? new ArrayList<>(doc.getDoctors()) : new ArrayList<>();
        boolean hasKanishka = checkDocs.stream().anyMatch(d -> d.getDoctorName() != null && d.getDoctorName().toLowerCase().contains("kanishka"));
        if (!hasKanishka) {
            checkDocs.add(DoctorProfileItem.builder()
                    .doctorId("27")
                    .doctorName("Dr. Kanishka")
                    .email("717823d126@kce.ac.in")
                    .specialty("Veterinary Physician & Surgeon")
                    .qualifications("B.V.Sc & A.H")
                    .vciRegistrationNumber("VERIFIED")
                    .verificationStatus("VERIFIED")
                    .languages(List.of("English", "Hindi", "Tamil"))
                    .speciesTreated(List.of("Dogs", "Cats"))
                    .build());
            doc.setDoctors(checkDocs);
            modified = true;
        }

        if (modified) {
            recalculateCompleteness(doc);
            doc = profileRepository.save(doc);
        }
        return doc;
    }

    /**
     * Get sanitized public profile for Pet Owners
     */
    public HospitalProfileDocument getPublicProfile(String slugOrId) {
        HospitalProfileDocument doc = profileRepository.findBySlug(slugOrId)
                .or(() -> profileRepository.findById(slugOrId))
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + slugOrId));

        doc = syncHospitalMainBranchAndStaff(doc);

        // Create sanitized public clone: remove private documents, unapproved evidence, internal audit logs
        HospitalProfileDocument publicDoc = new HospitalProfileDocument();
        publicDoc.setId(doc.getId());
        publicDoc.setOrganizationId(doc.getOrganizationId());
        publicDoc.setSlug(doc.getSlug());
        publicDoc.setHospitalName(doc.getHospitalName());
        publicDoc.setDisplayName(doc.getDisplayName() != null ? doc.getDisplayName() : doc.getHospitalName());
        publicDoc.setHospitalType(doc.getHospitalType());
        publicDoc.setDescription(doc.getDescription());
        publicDoc.setApproachToCare(doc.getApproachToCare());
        publicDoc.setPrimaryPhone(doc.getPrimaryPhone());
        publicDoc.setEmergencyPhone(doc.getEmergencyPhone());
        publicDoc.setPublicEmail(doc.getPublicEmail());
        publicDoc.setWebsiteUrl(doc.getWebsiteUrl());
        publicDoc.setLanguages(doc.getLanguages());
        publicDoc.setAnimalTypes(doc.getAnimalTypes());
        publicDoc.setStatus(doc.getStatus());
        publicDoc.setEmergencySupport247(doc.getEmergencySupport247());
        publicDoc.setHolidayExceptions(doc.getHolidayExceptions());
        publicDoc.setLogoUrl(doc.getLogoUrl());
        publicDoc.setCoverPhotoUrl(doc.getCoverPhotoUrl());
        publicDoc.setOpeningHours(doc.getOpeningHours());
        publicDoc.setLastPublishedAt(doc.getLastPublishedAt());
        publicDoc.setUpdatedAt(doc.getUpdatedAt());

        // Physical headquarters address
        publicDoc.setStreetAddress(doc.getStreetAddress());
        publicDoc.setCity(doc.getCity());
        publicDoc.setDistrict(doc.getDistrict());
        publicDoc.setStateName(doc.getStateName());
        publicDoc.setCountry(doc.getCountry());
        publicDoc.setPinCode(doc.getPinCode());
        publicDoc.setLatitude(doc.getLatitude());
        publicDoc.setLongitude(doc.getLongitude());
        publicDoc.setGoogleMapLink(doc.getGoogleMapLink());
        publicDoc.setDirectionsAndLandmarks(doc.getDirectionsAndLandmarks());

        // Filter public media only
        List<HospitalMedia> publicMedia = new ArrayList<>();
        if (doc.getMediaList() != null) {
            for (HospitalMedia m : doc.getMediaList()) {
                if (m.getIsPublic() == null || m.getIsPublic()) {
                    publicMedia.add(m);
                }
            }
        }
        publicDoc.setMediaList(publicMedia);

        // Sanitize branches (remove private internal evidence documents)
        List<HospitalBranch> publicBranches = new ArrayList<>();
        if (doc.getBranches() != null) {
            for (HospitalBranch b : doc.getBranches()) {
                HospitalBranch pubB = HospitalBranch.builder()
                        .branchId(b.getBranchId())
                        .branchName(b.getBranchName())
                        .isMainBranch(b.getIsMainBranch())
                        .streetAddress(b.getStreetAddress())
                        .city(b.getCity())
                        .district(b.getDistrict())
                        .stateName(b.getStateName())
                        .country(b.getCountry())
                        .pinCode(b.getPinCode())
                        .latitude(b.getLatitude())
                        .longitude(b.getLongitude())
                        .phone(b.getPhone())
                        .email(b.getEmail())
                        .directionsAndLandmarks(b.getDirectionsAndLandmarks())
                        .googleMapLink(b.getGoogleMapLink())
                        .locationVerificationStatus(b.getLocationVerificationStatus())
                        .build();
                publicBranches.add(pubB);
            }
        }
        publicDoc.setBranches(publicBranches);

        // Services (only published services)
        List<HospitalServiceItem> publicServices = new ArrayList<>();
        if (doc.getServices() != null) {
            for (HospitalServiceItem s : doc.getServices()) {
                if (s.getPublished() == null || s.getPublished()) {
                    publicServices.add(s);
                }
            }
        }
        publicDoc.setServices(publicServices);

        // Facilities (only published facilities)
        List<HospitalFacilityItem> publicFacilities = new ArrayList<>();
        if (doc.getFacilities() != null) {
            for (HospitalFacilityItem f : doc.getFacilities()) {
                if (f.getPublished() == null || f.getPublished()) {
                    publicFacilities.add(f);
                }
            }
        }
        publicDoc.setFacilities(publicFacilities);

        // Doctors
        publicDoc.setDoctors(doc.getDoctors());

        // Redacted for public view:
        publicDoc.setDocuments(new ArrayList<>());
        publicDoc.setAuditLogs(new ArrayList<>());
        publicDoc.setVerificationRecords(new ArrayList<>());

        return publicDoc;
    }

    /**
     * List all published hospitals for pet owner discovery
     */
    public List<HospitalProfileDocument> listPublishedHospitals(String query, String city) {
        List<HospitalProfileDocument> all = profileRepository.findAll();
        List<HospitalProfileDocument> matched = new ArrayList<>();

        for (HospitalProfileDocument p : all) {
            // Include PUBLISHED or VERIFIED or DRAFT for initial local platform discovery
            boolean nameMatch = query == null || query.isBlank() ||
                    (p.getHospitalName() != null && p.getHospitalName().toLowerCase().contains(query.toLowerCase())) ||
                    (p.getDisplayName() != null && p.getDisplayName().toLowerCase().contains(query.toLowerCase())) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(query.toLowerCase()));

            boolean cityMatch = city == null || city.isBlank() ||
                    (p.getBranches() != null && p.getBranches().stream().anyMatch(b -> b.getCity() != null && b.getCity().equalsIgnoreCase(city)));

            if (nameMatch && cityMatch) {
                matched.add(getPublicProfile(p.getId()));
            }
        }
        return matched;
    }

    /**
     * Update Basic Hospital Info & Identity
     */
    public HospitalProfileDocument updateHospitalInfo(String id, UpdateHospitalInfoRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);

        if (request.getHospitalName() != null) profile.setHospitalName(request.getHospitalName());
        if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName());
        if (request.getHospitalType() != null) profile.setHospitalType(request.getHospitalType());
        if (request.getDescription() != null) profile.setDescription(request.getDescription());
        if (request.getApproachToCare() != null) profile.setApproachToCare(request.getApproachToCare());
        if (request.getLegalEntityName() != null) profile.setLegalEntityName(request.getLegalEntityName());
        if (request.getAuthorizedRepresentative() != null) profile.setAuthorizedRepresentative(request.getAuthorizedRepresentative());
        if (request.getPrimaryPhone() != null) profile.setPrimaryPhone(request.getPrimaryPhone());
        if (request.getEmergencyPhone() != null) profile.setEmergencyPhone(request.getEmergencyPhone());
        if (request.getBillingEmail() != null) profile.setBillingEmail(request.getBillingEmail());
        if (request.getPublicEmail() != null) profile.setPublicEmail(request.getPublicEmail());
        if (request.getWebsiteUrl() != null) profile.setWebsiteUrl(request.getWebsiteUrl());
        if (request.getLanguages() != null) profile.setLanguages(request.getLanguages());
        if (request.getAnimalTypes() != null) profile.setAnimalTypes(request.getAnimalTypes());
        if (request.getClinicalEstablishmentRegNumber() != null) profile.setClinicalEstablishmentRegNumber(request.getClinicalEstablishmentRegNumber());
        if (request.getGstin() != null) profile.setGstin(request.getGstin());
        if (request.getCorporatePan() != null) profile.setCorporatePan(request.getCorporatePan());
        if (request.getIssuingAuthority() != null) profile.setIssuingAuthority(request.getIssuingAuthority());
        if (request.getRegistrationExpiryDate() != null) profile.setRegistrationExpiryDate(request.getRegistrationExpiryDate());
        if (request.getLogoUrl() != null) profile.setLogoUrl(request.getLogoUrl());
        if (request.getCoverPhotoUrl() != null) profile.setCoverPhotoUrl(request.getCoverPhotoUrl());
        if (request.getEmergencySupport247() != null) profile.setEmergencySupport247(request.getEmergencySupport247());
        if (request.getHolidayExceptions() != null) profile.setHolidayExceptions(request.getHolidayExceptions());

        // Update physical headquarters address fields
        if (request.getStreetAddress() != null) profile.setStreetAddress(request.getStreetAddress());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getDistrict() != null) profile.setDistrict(request.getDistrict());
        if (request.getStateName() != null) profile.setStateName(request.getStateName());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getPinCode() != null) profile.setPinCode(request.getPinCode());
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());
        if (request.getGoogleMapLink() != null) profile.setGoogleMapLink(request.getGoogleMapLink());
        if (request.getDirectionsAndLandmarks() != null) profile.setDirectionsAndLandmarks(request.getDirectionsAndLandmarks());

        // Ensure Main Branch is present in branches collection and synchronized
        List<HospitalBranch> branches = profile.getBranches() != null ? profile.getBranches() : new ArrayList<>();
        HospitalBranch mainBranch = branches.stream()
                .filter(b -> Boolean.TRUE.equals(b.getIsMainBranch()))
                .findFirst()
                .orElse(null);

        if (mainBranch == null && !branches.isEmpty()) {
            mainBranch = branches.get(0);
            mainBranch.setIsMainBranch(true);
        }

        if (mainBranch == null) {
            mainBranch = HospitalBranch.builder()
                    .branchId(UUID.randomUUID().toString())
                    .branchName(profile.getDisplayName() != null && !profile.getDisplayName().isBlank() ? profile.getDisplayName() + " - Main Campus" : "Main Hospital Campus")
                    .isMainBranch(true)
                    .locationVerificationStatus("PENDING")
                    .locationEvidenceList(new ArrayList<>())
                    .build();
            branches.add(mainBranch);
        }

        if (profile.getStreetAddress() != null) mainBranch.setStreetAddress(profile.getStreetAddress());
        if (profile.getCity() != null) mainBranch.setCity(profile.getCity());
        if (profile.getDistrict() != null) mainBranch.setDistrict(profile.getDistrict());
        if (profile.getStateName() != null) mainBranch.setStateName(profile.getStateName());
        if (profile.getCountry() != null) mainBranch.setCountry(profile.getCountry());
        if (profile.getPinCode() != null) mainBranch.setPinCode(profile.getPinCode());
        if (profile.getLatitude() != null) mainBranch.setLatitude(profile.getLatitude());
        if (profile.getLongitude() != null) mainBranch.setLongitude(profile.getLongitude());
        if (profile.getGoogleMapLink() != null) mainBranch.setGoogleMapLink(profile.getGoogleMapLink());
        if (profile.getDirectionsAndLandmarks() != null) mainBranch.setDirectionsAndLandmarks(profile.getDirectionsAndLandmarks());
        if (profile.getPrimaryPhone() != null && (mainBranch.getPhone() == null || mainBranch.getPhone().isBlank())) {
            mainBranch.setPhone(profile.getPrimaryPhone());
        }
        if (profile.getPublicEmail() != null && (mainBranch.getEmail() == null || mainBranch.getEmail().isBlank())) {
            mainBranch.setEmail(profile.getPublicEmail());
        }
        profile.setBranches(branches);

        // Update organization entity in MySQL if present
        if (profile.getOrganizationId() != null) {
            try {
                organizationRepository.findById(profile.getOrganizationId()).ifPresent(org -> {
                    if (profile.getHospitalName() != null) org.setRegisteredBusinessName(profile.getHospitalName());
                    if (profile.getPrimaryPhone() != null) org.setPrimaryContactMobile(profile.getPrimaryPhone());
                    if (profile.getBillingEmail() != null) org.setBillingEmailAddress(profile.getBillingEmail());
                    else if (profile.getPublicEmail() != null) org.setBillingEmailAddress(profile.getPublicEmail());
                    if (profile.getStreetAddress() != null) org.setAddress(profile.getStreetAddress());
                    if (profile.getCity() != null) org.setCity(profile.getCity());
                    if (profile.getEmergencySupport247() != null) org.setEmergencySupport247(profile.getEmergencySupport247());
                    organizationRepository.save(org);
                });
            } catch (Exception ex) {
                log.warn("Could not sync organization entity address: {}", ex.getMessage());
            }
        }

        // Refresh slug if empty
        if (profile.getSlug() == null || profile.getSlug().isBlank()) {
            profile.setSlug(generateSlug(profile.getHospitalName()));
        }

        recalculateCompleteness(profile);
        addAuditLog(profile, "UPDATE_INFO", actorId, actorRole, "Updated basic hospital profile & physical location fields");
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Add or Update Branch
     */
    public HospitalProfileDocument saveBranch(String id, SaveBranchRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        List<HospitalBranch> branches = profile.getBranches() != null ? profile.getBranches() : new ArrayList<>();

        HospitalBranch target = null;
        if (request.getBranchId() != null) {
            target = branches.stream().filter(b -> b.getBranchId().equals(request.getBranchId())).findFirst().orElse(null);
        }

        if (target == null) {
            target = new HospitalBranch();
            target.setBranchId(UUID.randomUUID().toString());
            target.setLocationVerificationStatus("UNVERIFIED");
            target.setLocationEvidenceList(new ArrayList<>());
            branches.add(target);
        }

        target.setBranchName(request.getBranchName());
        target.setIsMainBranch(request.getIsMainBranch() != null ? request.getIsMainBranch() : branches.size() == 1);
        target.setStreetAddress(request.getStreetAddress());
        target.setCity(request.getCity());
        target.setDistrict(request.getDistrict());
        target.setStateName(request.getStateName());
        target.setCountry(request.getCountry());
        target.setPinCode(request.getPinCode());
        target.setLatitude(request.getLatitude());
        target.setLongitude(request.getLongitude());
        target.setPhone(request.getPhone());
        target.setEmail(request.getEmail());
        target.setDirectionsAndLandmarks(request.getDirectionsAndLandmarks());
        target.setGoogleMapLink(request.getGoogleMapLink());

        if (Boolean.TRUE.equals(target.getIsMainBranch()) || branches.size() == 1) {
            profile.setStreetAddress(target.getStreetAddress());
            profile.setCity(target.getCity());
            profile.setDistrict(target.getDistrict());
            profile.setStateName(target.getStateName());
            profile.setCountry(target.getCountry());
            profile.setPinCode(target.getPinCode());
            profile.setLatitude(target.getLatitude());
            profile.setLongitude(target.getLongitude());
            profile.setGoogleMapLink(target.getGoogleMapLink());
            profile.setDirectionsAndLandmarks(target.getDirectionsAndLandmarks());
        }

        profile.setBranches(branches);
        recalculateCompleteness(profile);
        addAuditLog(profile, "SAVE_BRANCH", actorId, actorRole, "Saved branch: " + target.getBranchName());
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Delete Branch
     */
    public HospitalProfileDocument deleteBranch(String id, String branchId, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        if (profile.getBranches() != null) {
            String branchName = profile.getBranches().stream()
                    .filter(b -> b.getBranchId().equals(branchId))
                    .map(HospitalBranch::getBranchName)
                    .findFirst().orElse(branchId);

            boolean removed = profile.getBranches().removeIf(b -> b.getBranchId().equals(branchId));
            if (removed) {
                // If main branch was deleted and others remain, promote first one to main
                if (!profile.getBranches().isEmpty() && profile.getBranches().stream().noneMatch(b -> Boolean.TRUE.equals(b.getIsMainBranch()))) {
                    profile.getBranches().get(0).setIsMainBranch(true);
                }
                recalculateCompleteness(profile);
                addAuditLog(profile, "DELETE_BRANCH", actorId, actorRole, "Deleted branch: " + branchName);
                profile.setUpdatedAt(LocalDateTime.now());
                return profileRepository.save(profile);
            }
        }
        return profile;
    }

    /**
     * Update Branch Location Coordinates & Pin
     */
    public HospitalProfileDocument updateBranchLocation(String id, String branchId, UpdateBranchLocationRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        HospitalBranch branch = profile.getBranches().stream()
                .filter(b -> b.getBranchId().equals(branchId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + branchId));

        if (request.getLatitude() != null) branch.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) branch.setLongitude(request.getLongitude());
        if (request.getStreetAddress() != null) branch.setStreetAddress(request.getStreetAddress());
        if (request.getCity() != null) branch.setCity(request.getCity());
        if (request.getDistrict() != null) branch.setDistrict(request.getDistrict());
        if (request.getStateName() != null) branch.setStateName(request.getStateName());
        if (request.getPinCode() != null) branch.setPinCode(request.getPinCode());
        if (request.getGoogleMapLink() != null) branch.setGoogleMapLink(request.getGoogleMapLink());
        if (request.getDirectionsAndLandmarks() != null) branch.setDirectionsAndLandmarks(request.getDirectionsAndLandmarks());

        recalculateCompleteness(profile);
        addAuditLog(profile, "UPDATE_LOCATION", actorId, actorRole, "Updated location pin for branch " + branch.getBranchName());
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Submit Private Location Evidence (Building signage, utility bill, etc.)
     */
    public HospitalProfileDocument submitLocationEvidence(String id, String branchId, SubmitLocationEvidenceRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        HospitalBranch branch = profile.getBranches().stream()
                .filter(b -> b.getBranchId().equals(branchId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + branchId));

        LocationEvidence evidence = LocationEvidence.builder()
                .evidenceId(UUID.randomUUID().toString())
                .evidenceType(request.getEvidenceType())
                .fileUrl(request.getFileUrl())
                .reviewStatus("PENDING")
                .reviewerNotes(request.getReviewerNotes())
                .uploadedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        if (branch.getLocationEvidenceList() == null) {
            branch.setLocationEvidenceList(new ArrayList<>());
        }
        branch.getLocationEvidenceList().add(evidence);
        branch.setLocationVerificationStatus("EVIDENCE_SUBMITTED");

        addAuditLog(profile, "SUBMIT_LOCATION_EVIDENCE", actorId, actorRole, "Submitted evidence " + request.getEvidenceType() + " for branch " + branch.getBranchName());
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Delete Private Location Evidence
     */
    public HospitalProfileDocument deleteLocationEvidence(String id, String branchId, String evidenceId, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        HospitalBranch branch = profile.getBranches().stream()
                .filter(b -> b.getBranchId().equals(branchId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + branchId));

        if (branch.getLocationEvidenceList() != null) {
            boolean removed = branch.getLocationEvidenceList().removeIf(e -> e.getEvidenceId().equals(evidenceId));
            if (removed) {
                if (branch.getLocationEvidenceList().isEmpty()) {
                    branch.setLocationVerificationStatus("UNVERIFIED");
                } else {
                    boolean hasApproved = branch.getLocationEvidenceList().stream().anyMatch(e -> "APPROVED".equalsIgnoreCase(e.getReviewStatus()));
                    boolean hasPending = branch.getLocationEvidenceList().stream().anyMatch(e -> "PENDING".equalsIgnoreCase(e.getReviewStatus()));
                    if (hasApproved) {
                        branch.setLocationVerificationStatus("VERIFIED");
                    } else if (hasPending) {
                        branch.setLocationVerificationStatus("EVIDENCE_SUBMITTED");
                    } else {
                        branch.setLocationVerificationStatus("REJECTED");
                    }
                }
                addAuditLog(profile, "DELETE_LOCATION_EVIDENCE", actorId, actorRole, "Deleted location evidence from branch: " + branch.getBranchName());
                profile.setUpdatedAt(LocalDateTime.now());
                return profileRepository.save(profile);
            }
        }
        return profile;
    }

    /**
     * Update / Review Private Location Evidence
     */
    public HospitalProfileDocument updateLocationEvidence(String id, String branchId, String evidenceId, SubmitLocationEvidenceRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        HospitalBranch branch = profile.getBranches().stream()
                .filter(b -> b.getBranchId().equals(branchId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + branchId));

        if (branch.getLocationEvidenceList() != null) {
            LocationEvidence evidence = branch.getLocationEvidenceList().stream()
                    .filter(e -> e.getEvidenceId().equals(evidenceId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Evidence not found: " + evidenceId));

            if (request.getEvidenceType() != null) evidence.setEvidenceType(request.getEvidenceType());
            if (request.getFileUrl() != null) evidence.setFileUrl(request.getFileUrl());
            if (request.getReviewerNotes() != null) evidence.setReviewerNotes(request.getReviewerNotes());
            if (request.getReviewStatus() != null) {
                evidence.setReviewStatus(request.getReviewStatus());
                if ("APPROVED".equalsIgnoreCase(request.getReviewStatus())) {
                    branch.setLocationVerificationStatus("VERIFIED");
                } else if ("REJECTED".equalsIgnoreCase(request.getReviewStatus())) {
                    boolean hasApproved = branch.getLocationEvidenceList().stream().anyMatch(e -> "APPROVED".equalsIgnoreCase(e.getReviewStatus()));
                    if (!hasApproved) branch.setLocationVerificationStatus("REJECTED");
                } else if ("PENDING".equalsIgnoreCase(request.getReviewStatus())) {
                    boolean hasApproved = branch.getLocationEvidenceList().stream().anyMatch(e -> "APPROVED".equalsIgnoreCase(e.getReviewStatus()));
                    if (!hasApproved) branch.setLocationVerificationStatus("EVIDENCE_SUBMITTED");
                }
            }

            addAuditLog(profile, "UPDATE_LOCATION_EVIDENCE", actorId, actorRole, "Updated location evidence for branch " + branch.getBranchName());
            profile.setUpdatedAt(LocalDateTime.now());
            return profileRepository.save(profile);
        }
        return profile;
    }

    /**
     * Save Media (Photos / Videos)
     */
    public HospitalProfileDocument saveMedia(String id, SaveHospitalMediaRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        List<HospitalMedia> mediaList = profile.getMediaList() != null ? profile.getMediaList() : new ArrayList<>();

        HospitalMedia target = null;
        if (request.getMediaId() != null) {
            target = mediaList.stream().filter(m -> m.getMediaId().equals(request.getMediaId())).findFirst().orElse(null);
        }

        if (target == null) {
            target = new HospitalMedia();
            target.setMediaId(UUID.randomUUID().toString());
            target.setUploadDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE));
            target.setUploaderId(actorId);
            mediaList.add(target);
        }

        target.setUrl(request.getUrl());
        target.setCaption(request.getCaption());
        target.setCategory(request.getCategory() != null ? request.getCategory() : "GALLERY");
        target.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        target.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        target.setBranchId(request.getBranchId());

        if (Boolean.TRUE.equals(target.getIsPrimary())) {
            profile.setCoverPhotoUrl(target.getUrl());
        }

        profile.setMediaList(mediaList);
        recalculateCompleteness(profile);
        addAuditLog(profile, "SAVE_MEDIA", actorId, actorRole, "Saved media item category: " + target.getCategory());
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Delete Media
     */
    public HospitalProfileDocument deleteMedia(String id, String mediaId, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        if (profile.getMediaList() != null) {
            profile.getMediaList().removeIf(m -> m.getMediaId().equals(mediaId));
        }
        recalculateCompleteness(profile);
        addAuditLog(profile, "DELETE_MEDIA", actorId, actorRole, "Removed media ID: " + mediaId);
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Save Service Offering
     */
    public HospitalProfileDocument saveService(String id, SaveHospitalServiceRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        List<HospitalServiceItem> services = profile.getServices() != null ? profile.getServices() : new ArrayList<>();

        HospitalServiceItem target = null;
        if (request.getServiceId() != null) {
            target = services.stream().filter(s -> s.getServiceId().equals(request.getServiceId())).findFirst().orElse(null);
        }

        if (target == null) {
            target = new HospitalServiceItem();
            target.setServiceId(UUID.randomUUID().toString());
            target.setVerificationStatus("UNVERIFIED");
            services.add(target);
        }

        target.setServiceName(request.getServiceName());
        target.setCategory(request.getCategory());
        target.setDescription(request.getDescription());
        target.setSupportedSpecies(request.getSupportedSpecies() != null ? request.getSupportedSpecies() : List.of("Dogs", "Cats"));
        target.setBranchId(request.getBranchId());
        target.setPrice(request.getPrice());
        target.setPriceRange(request.getPriceRange());
        target.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        target.setConsultationFee(request.getConsultationFee());
        target.setTypicalDurationMinutes(request.getTypicalDurationMinutes() != null ? request.getTypicalDurationMinutes() : 30);
        target.setWalkInSupported(request.getWalkInSupported() != null ? request.getWalkInSupported() : true);
        target.setEmergencySupported(request.getEmergencySupported() != null ? request.getEmergencySupported() : false);
        target.setReferralRequired(request.getReferralRequired() != null ? request.getReferralRequired() : false);
        target.setRequiredEquipment(request.getRequiredEquipment());
        target.setPublished(request.getPublished() != null ? request.getPublished() : true);
        target.setLastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE));

        profile.setServices(services);
        recalculateCompleteness(profile);
        addAuditLog(profile, "SAVE_SERVICE", actorId, actorRole, "Saved service: " + target.getServiceName());
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Delete Service
     */
    public HospitalProfileDocument deleteService(String id, String serviceId, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        if (profile.getServices() != null) {
            profile.getServices().removeIf(s -> s.getServiceId().equals(serviceId));
        }
        recalculateCompleteness(profile);
        addAuditLog(profile, "DELETE_SERVICE", actorId, actorRole, "Deleted service ID: " + serviceId);
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Save Facility & Equipment Record
     */
    public HospitalProfileDocument saveFacility(String id, SaveHospitalFacilityRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        List<HospitalFacilityItem> facilities = profile.getFacilities() != null ? profile.getFacilities() : new ArrayList<>();

        HospitalFacilityItem target = null;
        if (request.getFacilityId() != null) {
            target = facilities.stream().filter(f -> f.getFacilityId().equals(request.getFacilityId())).findFirst().orElse(null);
        }

        if (target == null) {
            target = new HospitalFacilityItem();
            target.setFacilityId(UUID.randomUUID().toString());
            facilities.add(target);
        }

        target.setFacilityName(request.getFacilityName());
        target.setType(request.getType());
        target.setBranchId(request.getBranchId());
        target.setCapacity(request.getCapacity() != null ? request.getCapacity() : 1);
        target.setSupportedProcedures(request.getSupportedProcedures());
        target.setOperationalStatus(request.getOperationalStatus() != null ? request.getOperationalStatus() : "OPERATIONAL");
        target.setLastInspectedDate(request.getLastInspectedDate() != null ? request.getLastInspectedDate() : LocalDateTime.now().format(DateTimeFormatter.ISO_DATE));
        target.setInspectionStatus(request.getInspectionStatus() != null ? request.getInspectionStatus() : "PASSED");
        target.setPublished(request.getPublished() != null ? request.getPublished() : true);

        profile.setFacilities(facilities);
        recalculateCompleteness(profile);
        addAuditLog(profile, "SAVE_FACILITY", actorId, actorRole, "Saved facility record: " + target.getFacilityName());
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Delete Facility
     */
    public HospitalProfileDocument deleteFacility(String id, String facilityId, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        if (profile.getFacilities() != null) {
            profile.getFacilities().removeIf(f -> f.getFacilityId().equals(facilityId));
        }
        recalculateCompleteness(profile);
        addAuditLog(profile, "DELETE_FACILITY", actorId, actorRole, "Deleted facility ID: " + facilityId);
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Save Doctor Profile / Credential Link
     */
    public HospitalProfileDocument saveDoctor(String id, SaveDoctorProfileRequest request, String actorId, String actorRole) {
        if (request.getVciRegistrationNumber() == null || request.getVciRegistrationNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("A verified Veterinary Council of India (VCI) registration ID is mandatory for all linked medical practitioners.");
        }

        HospitalProfileDocument profile = getProfileById(id);
        List<DoctorProfileItem> doctors = profile.getDoctors() != null ? profile.getDoctors() : new ArrayList<>();

        DoctorProfileItem target = null;
        if (request.getDoctorId() != null) {
            target = doctors.stream().filter(d -> d.getDoctorId().equals(request.getDoctorId())).findFirst().orElse(null);
        }

        if (target == null) {
            target = new DoctorProfileItem();
            target.setDoctorId(UUID.randomUUID().toString());
            target.setVerificationStatus("VERIFIED");
            doctors.add(target);
        }

        target.setDoctorName(request.getDoctorName());
        target.setQualifications(request.getQualifications());
        target.setSpecialty(request.getSpecialty());
        target.setVciRegistrationNumber(request.getVciRegistrationNumber().trim());
        target.setLicenseExpiryDate(request.getLicenseExpiryDate());
        target.setSpeciesTreated(request.getSpeciesTreated() != null ? request.getSpeciesTreated() : List.of("Dogs", "Cats"));
        target.setLanguages(request.getLanguages() != null ? request.getLanguages() : List.of("English"));
        target.setBranchId(request.getBranchId());
        target.setPhotoUrl(request.getPhotoUrl());
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            target.setEmail(request.getEmail().trim());
        }

        profile.setDoctors(doctors);
        recalculateCompleteness(profile);
        addAuditLog(profile, "SAVE_DOCTOR", actorId, actorRole, "Saved doctor profile: " + target.getDoctorName() + " (VCI: " + target.getVciRegistrationNumber() + ")");
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Delete / Unlink Doctor Profile
     */
    public HospitalProfileDocument deleteDoctor(String id, String doctorId, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        if (profile.getDoctors() != null) {
            profile.getDoctors().removeIf(d -> d.getDoctorId().equals(doctorId));
        }
        recalculateCompleteness(profile);
        addAuditLog(profile, "DELETE_DOCTOR", actorId, actorRole, "Unlinked doctor ID: " + doctorId);
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Save Opening Hours & Emergency Availability
     */
    public HospitalProfileDocument saveOpeningHours(String id, SaveOpeningHoursRequest request, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);

        if (request.getOpeningHours() != null) {
            profile.setOpeningHours(request.getOpeningHours());
        }
        if (request.getEmergencySupport247() != null) {
            profile.setEmergencySupport247(request.getEmergencySupport247());
        }
        if (request.getHolidayExceptions() != null) {
            profile.setHolidayExceptions(request.getHolidayExceptions());
        }

        recalculateCompleteness(profile);
        addAuditLog(profile, "UPDATE_HOURS", actorId, actorRole, "Updated opening hours and emergency schedules");
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Submit Profile for Verification
     */
    public HospitalProfileDocument submitForReview(String id, String userNotes, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        profile.setStatus(ProfileStatus.SUBMITTED_FOR_REVIEW);

        addAuditLog(profile, "SUBMIT_FOR_REVIEW", actorId, actorRole,
                "Profile submitted for verification review. Notes: " + (userNotes != null ? userNotes : "None"));

        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Reviewer Decision on Profile (Admin/Reviewer only)
     */
    public HospitalProfileDocument reviewProfile(String id, ProfileReviewRequest request, String reviewerId, String reviewerName) {
        HospitalProfileDocument profile = getProfileById(id);

        VerificationRecord record = VerificationRecord.builder()
                .recordId(UUID.randomUUID().toString())
                .reviewerId(reviewerId)
                .reviewerName(reviewerName)
                .decision(request.getDecision())
                .scope(request.getScope() != null ? request.getScope() : "FULL_PROFILE")
                .notes(request.getReviewerNotes())
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        if (profile.getVerificationRecords() == null) {
            profile.setVerificationRecords(new ArrayList<>());
        }
        profile.getVerificationRecords().add(record);

        if ("APPROVED".equalsIgnoreCase(request.getDecision())) {
            profile.setStatus(ProfileStatus.VERIFIED);
        } else if ("CHANGES_REQUESTED".equalsIgnoreCase(request.getDecision())) {
            profile.setStatus(ProfileStatus.CHANGES_REQUESTED);
        } else if ("REJECTED".equalsIgnoreCase(request.getDecision())) {
            profile.setStatus(ProfileStatus.SUSPENDED);
        }

        addAuditLog(profile, "REVIEW_DECISION", reviewerId, "ADMIN",
                "Reviewer " + reviewerName + " made decision: " + request.getDecision() + ". Notes: " + request.getReviewerNotes());

        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Publish Profile Live
     */
    public HospitalProfileDocument publishProfile(String id, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);

        if (profile.getCompletenessScore() < 40) {
            throw new IllegalStateException("Profile completeness is under 40%. Please complete mandatory information before publishing.");
        }

        profile.setStatus(ProfileStatus.PUBLISHED);
        profile.setLastPublishedAt(LocalDateTime.now());
        addAuditLog(profile, "PUBLISH", actorId, actorRole, "Published hospital profile live to public discovery");
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Unpublish / Suspend Profile
     */
    public HospitalProfileDocument unpublishProfile(String id, String reason, String actorId, String actorRole) {
        HospitalProfileDocument profile = getProfileById(id);
        profile.setStatus(ProfileStatus.DRAFT);
        addAuditLog(profile, "UNPUBLISH", actorId, actorRole, "Unpublished profile. Reason: " + (reason != null ? reason : "Manual"));
        profile.setUpdatedAt(LocalDateTime.now());
        return profileRepository.save(profile);
    }

    /**
     * Calculate profile completeness score (0 - 100%)
     */
    public void recalculateCompleteness(HospitalProfileDocument p) {
        int score = 0;

        // 1. Basic Info (20%)
        if (p.getHospitalName() != null && !p.getHospitalName().isBlank() &&
            p.getDescription() != null && !p.getDescription().isBlank() &&
            p.getPrimaryPhone() != null && !p.getPrimaryPhone().isBlank() &&
            p.getAnimalTypes() != null && !p.getAnimalTypes().isEmpty()) {
            score += 20;
        } else if (p.getHospitalName() != null && !p.getHospitalName().isBlank()) {
            score += 10;
        }

        // 2. Location & Branches (15%)
        if (p.getBranches() != null && !p.getBranches().isEmpty()) {
            boolean hasValidPin = p.getBranches().stream().anyMatch(b -> b.getLatitude() != null && b.getLongitude() != null);
            if (hasValidPin) score += 15;
            else score += 10;
        }

        // 3. Media (15%)
        if (p.getCoverPhotoUrl() != null || p.getLogoUrl() != null) {
            score += 5;
        }
        if (p.getMediaList() != null && p.getMediaList().size() >= 2) {
            score += 10;
        } else if (p.getMediaList() != null && !p.getMediaList().isEmpty()) {
            score += 5;
        }

        // 4. Services (15%)
        if (p.getServices() != null && p.getServices().size() >= 2) {
            score += 15;
        } else if (p.getServices() != null && !p.getServices().isEmpty()) {
            score += 8;
        }

        // 5. Doctors & Credentials (15%)
        if (p.getDoctors() != null && !p.getDoctors().isEmpty()) {
            boolean hasVci = p.getDoctors().stream().anyMatch(d -> d.getVciRegistrationNumber() != null && !d.getVciRegistrationNumber().isBlank());
            if (hasVci) score += 15;
            else score += 10;
        }

        // 6. Facilities & Equipment (10%)
        if (p.getFacilities() != null && !p.getFacilities().isEmpty()) {
            score += 10;
        }

        // 7. Opening Hours (10%)
        if (p.getOpeningHours() != null && p.getOpeningHours().size() >= 5) {
            score += 10;
        } else if (p.getOpeningHours() != null && !p.getOpeningHours().isEmpty()) {
            score += 5;
        }

        p.setCompletenessScore(Math.min(100, score));
    }

    private void addAuditLog(HospitalProfileDocument profile, String action, String actorId, String actorRole, String details) {
        if (profile.getAuditLogs() == null) {
            profile.setAuditLogs(new ArrayList<>());
        }
        profile.getAuditLogs().add(0, HospitalAuditLog.builder()
                .logId(UUID.randomUUID().toString())
                .action(action)
                .actorId(actorId != null ? actorId : "SYSTEM")
                .actorRole(actorRole != null ? actorRole : "ROLE_VET_ORGANIZATION")
                .details(details)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build());
    }

    private HospitalProfileDocument bootstrapFromOrganization(UUID organizationId) {
        VetOrganization org = organizationRepository.findById(organizationId)
                .orElse(null);

        if (org == null) {
            List<VetOrganization> anyOrg = organizationRepository.findAll();
            if (!anyOrg.isEmpty()) {
                org = anyOrg.get(0);
                organizationId = org.getOrganizationId();
            }
        }

        String businessName = org != null && org.getRegisteredBusinessName() != null ? org.getRegisteredBusinessName() : "Karpagam Hospital & Research Center";
        String city = org != null && org.getCity() != null ? org.getCity() : "Ottakkalmandapam";
        String address = org != null && org.getAddress() != null ? org.getAddress() : "Pollachi Main Rd, Ottakkalmandapam, Tamil Nadu 641032";
        String mobile = org != null && org.getPrimaryContactMobile() != null ? org.getPrimaryContactMobile() : "9876789564";
        String email = org != null && org.getBillingEmailAddress() != null ? org.getBillingEmailAddress() : "chauminsooshi@gmail.com";

        // Real branch from database organization - Main branch is always initialized
        List<HospitalBranch> branches = new ArrayList<>();
        HospitalBranch mainBranch = HospitalBranch.builder()
                .branchId(UUID.randomUUID().toString())
                .branchName(businessName != null && !businessName.isBlank() ? businessName + " - Main Campus" : "Main Hospital Campus")
                .isMainBranch(true)
                .streetAddress(address)
                .city(city)
                .country("India")
                .phone(mobile)
                .email(email)
                .locationVerificationStatus("PENDING")
                .locationEvidenceList(new ArrayList<>())
                .build();
        branches.add(mainBranch);

        // Query real registered veterinary doctors from staff repository
        List<DoctorProfileItem> doctors = new ArrayList<>();
        if (organizationId != null) {
            try {
                List<VetStaffRegistry> staffList = staffRepository.findByParentOrganization_OrganizationId(organizationId);
                if (staffList != null) {
                    for (VetStaffRegistry staff : staffList) {
                        if (staff.getAssignedSystemRole() == VetStaffRegistry.SystemRole.ROLE_VET_DOCTOR
                                && staff.getEmploymentStatus() == VetStaffRegistry.EmploymentStatus.ACTIVE) {
                            String name = staff.getDoctorName() != null ? staff.getDoctorName() : "Doctor";
                            if (name.toLowerCase().contains("hospital administrator")
                                    || "VCI-TS-2024-001".equalsIgnoreCase(staff.getVciRegistrationNumber())) {
                                continue;
                            }
                            doctors.add(DoctorProfileItem.builder()
                                    .doctorId(staff.getUserId().toString())
                                    .doctorName(name)
                                    .specialty(staff.getSpecialization() != null ? staff.getSpecialization() : "Veterinary Surgeon & Physician")
                                    .vciRegistrationNumber(staff.getVciRegistrationNumber() != null ? staff.getVciRegistrationNumber() : "Verified")
                                    .verificationStatus("VERIFIED")
                                    .languages(List.of("English", "Hindi"))
                                    .speciesTreated(List.of("Dogs", "Cats"))
                                    .build());
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Could not load staff for organization: {}", organizationId, ex);
            }
        }

        // Clean opening hours template
        List<DayOpeningHour> defaultHours = new ArrayList<>();
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        for (String day : days) {
            defaultHours.add(DayOpeningHour.builder()
                    .dayOfWeek(day)
                    .isOpen(true)
                    .openTime("09:00")
                    .closeTime("19:00")
                    .isEmergency24x7(Boolean.TRUE.equals(org != null ? org.getEmergencySupport247() : false))
                    .build());
        }

        HospitalProfileDocument profile = HospitalProfileDocument.builder()
                .organizationId(organizationId)
                .slug(generateSlug(businessName))
                .hospitalName(businessName)
                .displayName(businessName)
                .hospitalType("VETERINARY_HOSPITAL")
                .description(null)
                .approachToCare(null)
                .legalEntityName(org != null ? org.getRegisteredBusinessName() : null)
                .authorizedRepresentative("Authorized Hospital Administrator")
                .primaryPhone(mobile)
                .emergencyPhone(Boolean.TRUE.equals(org != null ? org.getEmergencySupport247() : false) ? mobile : null)
                .billingEmail(email)
                .publicEmail(email)
                .websiteUrl(null)
                .languages(List.of("English", "Hindi"))
                .animalTypes(List.of("Dogs", "Cats"))
                .clinicalEstablishmentRegNumber(org != null ? org.getClinicalEstablishmentActRegNumber() : null)
                .gstin(org != null ? org.getGstin() : null)
                .corporatePan(org != null ? org.getCorporatePan() : null)
                .issuingAuthority(null)
                .registrationExpiryDate(null)
                .status(ProfileStatus.DRAFT)
                .completenessScore(0)
                .emergencySupport247(Boolean.TRUE.equals(org != null ? org.getEmergencySupport247() : false))
                .holidayExceptions(null)
                .logoUrl(null)
                .coverPhotoUrl(null)
                .streetAddress(address)
                .city(city)
                .country("India")
                .mediaList(new ArrayList<>())
                .branches(branches)
                .services(new ArrayList<>())
                .facilities(new ArrayList<>())
                .doctors(doctors)
                .openingHours(defaultHours)
                .documents(new ArrayList<>())
                .verificationRecords(new ArrayList<>())
                .auditLogs(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        recalculateCompleteness(profile);
        addAuditLog(profile, "BOOTSTRAP", "SYSTEM", "SYSTEM", "Profile initialized directly from database organization registry.");
        return profileRepository.save(profile);
    }

    private String generateSlug(String name) {
        if (name == null || name.isBlank()) return "vet-hospital-" + UUID.randomUUID().toString().substring(0, 8);
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isBlank() ? "vet-hospital-" + UUID.randomUUID().toString().substring(0, 8) : slug;
    }
}
