package com.jivathunai.petprofile.service;

import com.jivathunai.petprofile.document.PetProfileDoc;
import com.jivathunai.petprofile.entity.PetRegistry;
import com.jivathunai.petprofile.repository.PetProfileDocRepository;
import com.jivathunai.petprofile.repository.PetRegistryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CryptographicQrService {

    private final PetRegistryRepository petRegistryRepository;
    private final PetProfileDocRepository petProfileDocRepository;

    @Autowired
    public CryptographicQrService(PetRegistryRepository petRegistryRepository, PetProfileDocRepository petProfileDocRepository) {
        this.petRegistryRepository = petRegistryRepository;
        this.petProfileDocRepository = petProfileDocRepository;
    }

    public String formatProfessionalProfileId(UUID petId) {
        if (petId == null) {
            petId = UUID.randomUUID();
        }
        String cleanUuid = petId.toString().replace("-", "").toUpperCase();
        String chunk1 = cleanUuid.length() >= 4 ? cleanUuid.substring(0, 4) : "0000";
        String chunk2 = cleanUuid.length() >= 8 ? cleanUuid.substring(4, 8) : "0000";
        return "JIVA-IND-2026-" + chunk1 + "-" + chunk2;
    }

    public String generateAndAssignQrHash(UUID petId, UUID currentOwnerId) {
        return formatProfessionalProfileId(petId);
    }

    public Map<String, Object> resolvePublicProfile(String qrHash) {
        return resolveProfile(qrHash, null);
    }

    public Map<String, Object> resolvePublicPassport(String qrHash) {
        return resolveProfile(qrHash, null);
    }

    private PetProfileDoc findProfileByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return null;
        }
        String cleanId = identifier.trim();

        // 1. Exact match on qrCodePayloadString
        PetProfileDoc profile = petProfileDocRepository.findByQrProfileMetadata_QrCodePayloadString(cleanId)
                .orElse(null);

        // 2. Case-insensitive lookup across documents
        if (profile == null) {
            List<PetProfileDoc> all = petProfileDocRepository.findAll();
            for (PetProfileDoc p : all) {
                if (p.getQrProfileMetadata() != null && p.getQrProfileMetadata().getQrCodePayloadString() != null) {
                    if (p.getQrProfileMetadata().getQrCodePayloadString().equalsIgnoreCase(cleanId)) {
                        return p;
                    }
                }
            }
        }

        // 3. Match against deterministic professional format for all existing pets
        if (profile == null) {
            List<PetProfileDoc> all = petProfileDocRepository.findAll();
            for (PetProfileDoc p : all) {
                if (p.getPetId() != null) {
                    String profId = formatProfessionalProfileId(p.getPetId());
                    if (profId.equalsIgnoreCase(cleanId)) {
                        return p;
                    }
                }
            }
        }

        // 4. Fallback match by petId UUID if valid
        if (profile == null) {
            try {
                UUID petUuid = UUID.fromString(cleanId);
                profile = petProfileDocRepository.findById(petUuid).orElse(null);
            } catch (IllegalArgumentException ignored) {
            }
        }
        return profile;
    }

    public Map<String, Object> resolveProfile(String identifier, UUID requesterOwnerId) {
        return resolveProfile(identifier, requesterOwnerId, null);
    }

    public Map<String, Object> resolveProfile(String identifier, UUID requesterOwnerId, String rawRequesterId) {
        final PetProfileDoc profile = findProfileByIdentifier(identifier);

        if (profile == null) {
            return null;
        }

        // Fetch registry for owner and license verification
        PetRegistry registry = petRegistryRepository.findById(profile.getPetId()).orElse(null);
        boolean isOwner = false;
        if (registry != null && registry.getCurrentOwnerId() != null) {
            UUID regOwner = registry.getCurrentOwnerId();
            if (requesterOwnerId != null && requesterOwnerId.equals(regOwner)) {
                isOwner = true;
            } else if (rawRequesterId != null && !rawRequesterId.isBlank()) {
                String raw = rawRequesterId.trim();
                if (regOwner.toString().equalsIgnoreCase(raw)) {
                    isOwner = true;
                } else if (UUID.nameUUIDFromBytes(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8)).equals(regOwner)) {
                    isOwner = true;
                } else {
                    try {
                        long num = Long.parseLong(raw);
                        if (regOwner.equals(new UUID(0L, num))) {
                            isOwner = true;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        PetProfileDoc.ProfileVisibility visibility = profile.getProfileVisibility();
        if (visibility == null) {
            visibility = PetProfileDoc.ProfileVisibility.builder()
                .isPublic(true)
                .showPhysicalAttributes(true)
                .showCertificates(true)
                .showMedia(true)
                .showMedicalRecords(false)
                .build();
        }
        boolean isPublicProfile = visibility.isPublic();

        // If not owner, check active state and public visibility
        if (!isOwner) {
            if (profile.getQrProfileMetadata() != null && !profile.getQrProfileMetadata().isActive()) {
                Map<String, Object> inactiveMap = new HashMap<>();
                inactiveMap.put("platformName", "Jiva Thunai Digital Pet Profile");
                inactiveMap.put("petId", profile.getPetId());
                inactiveMap.put("isOwner", false);
                inactiveMap.put("isPublic", false);
                inactiveMap.put("isActive", false);
                inactiveMap.put("message", "This pet profile is currently inactive.");
                return inactiveMap;
            }

            if (!isPublicProfile) {
                Map<String, Object> privateMap = new HashMap<>();
                privateMap.put("platformName", "Jiva Thunai Digital Pet Profile");
                privateMap.put("petId", profile.getPetId());
                privateMap.put("isOwner", false);
                privateMap.put("isPublic", false);
                privateMap.put("isActive", true);
                privateMap.put("message", "This pet profile is private and cannot be viewed publicly.");
                if (profile.getBasicProfile() != null) {
                    privateMap.put("petName", profile.getBasicProfile().getName());
                    privateMap.put("species", profile.getBasicProfile().getSpecies());
                    privateMap.put("breed", profile.getBasicProfile().getBreed());
                }
                return privateMap;
            }
        }

        // Auto-upgrade legacy random IDs to professional format
        String qrHash = profile.getQrProfileMetadata() != null ? profile.getQrProfileMetadata().getQrCodePayloadString() : null;
        if (qrHash == null || !qrHash.startsWith("JIVA-")) {
            qrHash = formatProfessionalProfileId(profile.getPetId());
            if (profile.getQrProfileMetadata() == null) {
                profile.setQrProfileMetadata(new PetProfileDoc.qrProfileMetadata());
            }
            profile.getQrProfileMetadata().setQrCodePayloadString(qrHash);
            profile.getQrProfileMetadata().setPublicProfileUrl("/pet/public/" + qrHash);
            profile.getQrProfileMetadata().setActive(true);
            petProfileDocRepository.save(profile);
        }

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("platformName", "Jiva Thunai Digital Pet Profile");
        profileData.put("petId", profile.getPetId());
        profileData.put("isOwner", isOwner);
        profileData.put("isPublic", isPublicProfile);
        profileData.put("profileVisibility", visibility);
        
        if (registry != null) {
            profileData.put("ownerId", registry.getCurrentOwnerId().toString());
            profileData.put("municipalLicenseNumber", registry.getMunicipalLicenseNumber());
            profileData.put("registrationDate", registry.getRegistrationDate());
            profileData.put("status", registry.getStatus() != null ? registry.getStatus().name() : "ACTIVE");
        }

        profileData.put("qrHash", qrHash);
        profileData.put("publicProfileUrl", "/pet/public/" + qrHash);

        if (profile.getBasicProfile() != null) {
            profileData.put("petName", profile.getBasicProfile().getName());
            profileData.put("species", profile.getBasicProfile().getSpecies());
            profileData.put("breed", profile.getBasicProfile().getBreed());
            profileData.put("gender", profile.getBasicProfile().getGender() != null ? profile.getBasicProfile().getGender().name() : null);
            profileData.put("dateOfBirth", profile.getBasicProfile().getDateOfBirth());
            profileData.put("description", profile.getBasicProfile().getDescription());
            profileData.put("identifyingMarks", profile.getBasicProfile().getIdentifyingMarks());
            
            if (isOwner || visibility.isShowPhysicalAttributes()) {
                profileData.put("color", profile.getBasicProfile().getBaseColor());
                profileData.put("weightKg", profile.getBasicProfile().getWeightKg());
                profileData.put("heightCm", profile.getBasicProfile().getHeightCm());
                profileData.put("microchipNumber", profile.getBasicProfile().getMicrochipNumber());
            }
        }

        if ((isOwner || visibility.isShowMedia()) && profile.getMediaGallery() != null) {
            if (profile.getMediaGallery().getPhotos() != null) {
                final List<PetProfileDoc.Photo> photos = profile.getMediaGallery().getPhotos();
                profileData.put("photos", photos);
                photos.stream()
                    .filter(PetProfileDoc.Photo::isPrimary)
                    .findFirst()
                    .ifPresentOrElse(
                        photo -> profileData.put("primaryPhotoUrl", photo.getUrl()),
                        () -> {
                            if (!photos.isEmpty()) {
                                profileData.put("primaryPhotoUrl", photos.get(0).getUrl());
                            }
                        }
                    );
            }
            if (profile.getMediaGallery().getVideos() != null) {
                profileData.put("videos", profile.getMediaGallery().getVideos());
            }
        }

        if ((isOwner || visibility.isShowCertificates()) && profile.getMediaGallery() != null && profile.getMediaGallery().getDocuments() != null) {
            profileData.put("documents", profile.getMediaGallery().getDocuments().stream().map(doc -> {
                Map<String, Object> docMeta = new HashMap<>();
                docMeta.put("docId", doc.getDocId());
                docMeta.put("documentType", doc.getDocumentType() != null ? doc.getDocumentType().name() : null);
                docMeta.put("isVerifiedByAdmin", doc.isVerifiedByAdmin());
                return docMeta;
            }).toList());
        }

        if (profile.getQrProfileMetadata() != null && profile.getQrProfileMetadata().getEmergencyContactOverride() != null) {
            profileData.put("emergencyContactName", profile.getQrProfileMetadata().getEmergencyContactOverride().getName());
            profileData.put("emergencyContactPhone", profile.getQrProfileMetadata().getEmergencyContactOverride().getPhone());
            profileData.put("bloodGroup", profile.getQrProfileMetadata().getEmergencyContactOverride().getBloodGroup());
        }

        return profileData;
    }
}
