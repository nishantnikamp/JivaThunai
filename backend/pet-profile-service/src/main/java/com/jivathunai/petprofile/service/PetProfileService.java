package com.jivathunai.petprofile.service;

import com.jivathunai.petprofile.document.PetProfileDoc;
import com.jivathunai.petprofile.entity.PetRegistry;
import com.jivathunai.petprofile.repository.PetProfileDocRepository;
import com.jivathunai.petprofile.repository.PetRegistryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class PetProfileService {

    private final PetRegistryRepository petRegistryRepository;
    private final PetProfileDocRepository petProfileDocRepository;
    private final S3StorageService s3StorageService;
    private final CryptographicQrService qrService;

    @Autowired
    public PetProfileService(PetRegistryRepository petRegistryRepository,
                             PetProfileDocRepository petProfileDocRepository,
                             S3StorageService s3StorageService,
                             CryptographicQrService qrService) {
        this.petRegistryRepository = petRegistryRepository;
        this.petProfileDocRepository = petProfileDocRepository;
        this.s3StorageService = s3StorageService;
        this.qrService = qrService;
    }

    @Transactional
    public PetProfileDoc onboardPet(UUID ownerId, PetProfileDoc.BasicProfile basicProfile, 
                                  PetProfileDoc.ProfileVisibility profileVisibility,
                                  List<String> photosUrl, List<String> videosUrl,
                                  MultipartFile healthCertificate, MultipartFile breedCertificate) throws IOException {
        
        // 1. Create SQL Registry Record
        PetRegistry registry = PetRegistry.builder()
                .currentOwnerId(ownerId)
                .registrationDate(new Timestamp(System.currentTimeMillis()))
                .status(PetRegistry.PetStatus.ACTIVE)
                .microchipNumber(basicProfile.getMicrochipNumber()) // Sync microchip
                .build();
        
        registry = petRegistryRepository.save(registry);
        UUID petId = registry.getPetId();

        // 2. Process Files to S3
        List<PetProfileDoc.ProfileDocument> documents = new ArrayList<>();
        
        if (healthCertificate != null && !healthCertificate.isEmpty()) {
            String healthKey = s3StorageService.uploadSecureDocument(healthCertificate, "health-certificates");
            documents.add(PetProfileDoc.ProfileDocument.builder()
                    .docId(UUID.randomUUID().toString())
                    .documentType(PetProfileDoc.DocumentType.HEALTH_CERTIFICATE)
                    .secureS3Key(healthKey)
                    .isVerifiedByAdmin(false)
                    .uploadedAt(new Date())
                    .build());
        }

        if (breedCertificate != null && !breedCertificate.isEmpty()) {
            String breedKey = s3StorageService.uploadSecureDocument(breedCertificate, "breed-certificates");
            documents.add(PetProfileDoc.ProfileDocument.builder()
                    .docId(UUID.randomUUID().toString())
                    .documentType(PetProfileDoc.DocumentType.BREED_CERTIFICATE)
                    .secureS3Key(breedKey)
                    .isVerifiedByAdmin(false)
                    .uploadedAt(new Date())
                    .build());
        }

        List<PetProfileDoc.Photo> photos = new ArrayList<>();
        if (photosUrl != null) {
            for (String url : photosUrl) {
                photos.add(PetProfileDoc.Photo.builder()
                        .assetId(UUID.randomUUID().toString())
                        .url(url)
                        .uploadedAt(new Date())
                        .build());
            }
        }
        
        List<PetProfileDoc.Video> videos = new ArrayList<>();
        if (videosUrl != null) {
            for (String url : videosUrl) {
                videos.add(PetProfileDoc.Video.builder()
                        .assetId(UUID.randomUUID().toString())
                        .url(url)
                        .uploadedAt(new Date())
                        .build());
            }
        }

        PetProfileDoc.MediaGallery gallery = PetProfileDoc.MediaGallery.builder()
                .documents(documents)
                .photos(photos)
                .videos(videos)
                .build();

        // 3. Generate QR Passport Identity
        String qrHash = qrService.generateAndAssignQrHash(petId, ownerId);
        PetProfileDoc.qrProfileMetadata qrMetadata = PetProfileDoc.qrProfileMetadata.builder()
                .qrCodePayloadString(qrHash)
                .isActive(true)
                .publicProfileUrl("/pet/public/" + qrHash)
                .build();

        // 4. Save MongoDB Document
        if (profileVisibility == null) {
            profileVisibility = PetProfileDoc.ProfileVisibility.builder()
                .isPublic(false)
                .showPhysicalAttributes(true)
                .showCertificates(false)
                .showMedia(true)
                .showMedicalRecords(false)
                .build();
        }

        PetProfileDoc passport = PetProfileDoc.builder()
                .petId(petId)
                .basicProfile(basicProfile)
                .mediaGallery(gallery)
                .qrProfileMetadata(qrMetadata)
                .profileVisibility(profileVisibility)
                .build();

        return petProfileDocRepository.save(passport);
    }

    public List<PetProfileDoc> getPetsByOwnerId(UUID ownerId) {
        List<PetRegistry> registries = petRegistryRepository.findByCurrentOwnerId(ownerId);
        List<UUID> petIds = new ArrayList<>();
        for (PetRegistry r : registries) {
            petIds.add(r.getPetId());
        }
        
        List<PetProfileDoc> passports = new ArrayList<>();
        if (!petIds.isEmpty()) {
            passports = (List<PetProfileDoc>) petProfileDocRepository.findAllById(petIds);
            for (PetProfileDoc p : passports) {
                String cur = p.getQrProfileMetadata() != null ? p.getQrProfileMetadata().getQrCodePayloadString() : null;
                if (cur == null || !cur.startsWith("JIVA-")) {
                    String cleanId = qrService.formatProfessionalProfileId(p.getPetId());
                    if (p.getQrProfileMetadata() == null) {
                        p.setQrProfileMetadata(new PetProfileDoc.qrProfileMetadata());
                    }
                    p.getQrProfileMetadata().setQrCodePayloadString(cleanId);
                    p.getQrProfileMetadata().setPublicProfileUrl("/pet/public/" + cleanId);
                    p.getQrProfileMetadata().setActive(true);
                    petProfileDocRepository.save(p);
                }
            }
        }
        return passports;
    }

    @Transactional
    public PetProfileDoc updatePetProfile(UUID petId, UUID requesterOwnerId,
                                          PetProfileDoc.BasicProfile basicProfile,
                                          PetProfileDoc.ProfileVisibility visibility,
                                          PetProfileDoc.EmergencyContactOverride emergencyContact,
                                          List<String> photosUrl, List<String> videosUrl,
                                          MultipartFile healthCertificate,
                                          MultipartFile breedCertificate) {
        PetRegistry registry = petRegistryRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        if (requesterOwnerId != null && !registry.getCurrentOwnerId().equals(requesterOwnerId)) {
            throw new SecurityException("Unauthorized: You do not own this pet profile.");
        }

        PetProfileDoc profile = petProfileDocRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet profile document not found with ID: " + petId));

        if (basicProfile != null) {
            PetProfileDoc.BasicProfile current = profile.getBasicProfile();
            if (current == null) {
                current = new PetProfileDoc.BasicProfile();
            }
            if (basicProfile.getName() != null) current.setName(basicProfile.getName());
            if (basicProfile.getSpecies() != null) current.setSpecies(basicProfile.getSpecies());
            if (basicProfile.getBreed() != null) current.setBreed(basicProfile.getBreed());
            if (basicProfile.getGender() != null) current.setGender(basicProfile.getGender());
            if (basicProfile.getDateOfBirth() != null) current.setDateOfBirth(basicProfile.getDateOfBirth());
            if (basicProfile.getBaseColor() != null) current.setBaseColor(basicProfile.getBaseColor());
            if (basicProfile.getWeightKg() != null) current.setWeightKg(basicProfile.getWeightKg());
            if (basicProfile.getHeightCm() != null) current.setHeightCm(basicProfile.getHeightCm());
            if (basicProfile.getIdentifyingMarks() != null) current.setIdentifyingMarks(basicProfile.getIdentifyingMarks());
            if (basicProfile.getDescription() != null) current.setDescription(basicProfile.getDescription());
            if (basicProfile.getMicrochipNumber() != null) {
                current.setMicrochipNumber(basicProfile.getMicrochipNumber());
                registry.setMicrochipNumber(basicProfile.getMicrochipNumber());
            }
            profile.setBasicProfile(current);
        }

        if (visibility != null) {
            profile.setProfileVisibility(visibility);
        }

        if (emergencyContact != null) {
            if (profile.getQrProfileMetadata() == null) {
                profile.setQrProfileMetadata(new PetProfileDoc.qrProfileMetadata());
            }
            profile.getQrProfileMetadata().setEmergencyContactOverride(emergencyContact);
        }

        if (profile.getMediaGallery() == null) {
            profile.setMediaGallery(new PetProfileDoc.MediaGallery());
        }

        // Process certificates if uploaded
        List<PetProfileDoc.ProfileDocument> documents = profile.getMediaGallery().getDocuments();
        if (documents == null) {
            documents = new ArrayList<>();
        }

        try {
            if (healthCertificate != null && !healthCertificate.isEmpty()) {
                String healthKey = s3StorageService.uploadSecureDocument(healthCertificate, "health-certificates");
                documents.removeIf(d -> d.getDocumentType() == PetProfileDoc.DocumentType.HEALTH_CERTIFICATE);
                documents.add(PetProfileDoc.ProfileDocument.builder()
                        .docId(UUID.randomUUID().toString())
                        .documentType(PetProfileDoc.DocumentType.HEALTH_CERTIFICATE)
                        .secureS3Key(healthKey)
                        .isVerifiedByAdmin(false)
                        .uploadedAt(new Date())
                        .build());
            }

            if (breedCertificate != null && !breedCertificate.isEmpty()) {
                String breedKey = s3StorageService.uploadSecureDocument(breedCertificate, "breed-certificates");
                documents.removeIf(d -> d.getDocumentType() == PetProfileDoc.DocumentType.BREED_CERTIFICATE);
                documents.add(PetProfileDoc.ProfileDocument.builder()
                        .docId(UUID.randomUUID().toString())
                        .documentType(PetProfileDoc.DocumentType.BREED_CERTIFICATE)
                        .secureS3Key(breedKey)
                        .isVerifiedByAdmin(false)
                        .uploadedAt(new Date())
                        .build());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded certificate file: " + e.getMessage(), e);
        }
        profile.getMediaGallery().setDocuments(documents);

        if (photosUrl != null) {
            List<PetProfileDoc.Photo> photos = new ArrayList<>();
            for (String url : photosUrl) {
                photos.add(PetProfileDoc.Photo.builder()
                        .assetId(UUID.randomUUID().toString())
                        .url(url)
                        .uploadedAt(new Date())
                        .build());
            }
            profile.getMediaGallery().setPhotos(photos);
        }

        if (videosUrl != null) {
            List<PetProfileDoc.Video> videos = new ArrayList<>();
            for (String url : videosUrl) {
                videos.add(PetProfileDoc.Video.builder()
                        .assetId(UUID.randomUUID().toString())
                        .url(url)
                        .uploadedAt(new Date())
                        .build());
            }
            profile.getMediaGallery().setVideos(videos);
        }

        petRegistryRepository.save(registry);
        return petProfileDocRepository.save(profile);
    }

    @Transactional
    public void deletePetProfile(UUID petId, UUID requesterOwnerId) {
        PetRegistry registry = petRegistryRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        if (requesterOwnerId != null && !registry.getCurrentOwnerId().equals(requesterOwnerId)) {
            throw new SecurityException("Unauthorized: You do not own this pet profile.");
        }

        petProfileDocRepository.deleteById(petId);
        petRegistryRepository.delete(registry);
    }
}
