package com.jivathunai.petprofile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.petprofile.document.PetProfileDoc;
import com.jivathunai.petprofile.repository.PetProfileDocRepository;
import com.jivathunai.petprofile.service.CryptographicQrService;
import com.jivathunai.petprofile.service.PetProfileService;
import com.jivathunai.petprofile.service.S3StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pets")
public class PetProfileController {

    private final PetProfileService petProfileService;
    private final CryptographicQrService qrService;
    private final PetProfileDocRepository petProfileDocRepository;
    private final S3StorageService s3StorageService;
    private final ObjectMapper objectMapper;

    @Autowired
    public PetProfileController(PetProfileService petProfileService,
                                CryptographicQrService qrService,
                                PetProfileDocRepository petProfileDocRepository,
                                S3StorageService s3StorageService,
                                ObjectMapper objectMapper) {
        this.petProfileService = petProfileService;
        this.qrService = qrService;
        this.petProfileDocRepository = petProfileDocRepository;
        this.s3StorageService = s3StorageService;
        this.objectMapper = objectMapper;
    }

    private UUID parseOwnerUuid(String ownerId) {
        if (ownerId == null || ownerId.trim().isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(ownerId);
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(ownerId.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetProfileDoc>> onboardPet(
            @RequestParam("ownerId") String ownerId,
            @RequestParam("basicProfile") String basicProfileJson,
            @RequestParam(value = "profileVisibility", required = false) String profileVisibilityJson,
            @RequestParam(value = "photos", required = false) List<String> photos,
            @RequestParam(value = "videos", required = false) List<String> videos,
            @RequestParam(value = "healthCertificate", required = false) MultipartFile healthCertificate,
            @RequestParam(value = "breedCertificate", required = false) MultipartFile breedCertificate) {
        try {
            UUID ownerUuid = parseOwnerUuid(ownerId);
            PetProfileDoc.BasicProfile basicProfile = objectMapper.readValue(basicProfileJson, PetProfileDoc.BasicProfile.class);
            PetProfileDoc.ProfileVisibility profileVisibility = null;
            if (profileVisibilityJson != null && !profileVisibilityJson.trim().isEmpty()) {
                try {
                    profileVisibility = objectMapper.readValue(profileVisibilityJson, PetProfileDoc.ProfileVisibility.class);
                } catch (Exception ignored) {
                }
            }
            if (profileVisibility == null) {
                profileVisibility = PetProfileDoc.ProfileVisibility.builder()
                        .isPublic(true)
                        .showPhysicalAttributes(true)
                        .showCertificates(true)
                        .showMedia(true)
                        .showMedicalRecords(false)
                        .build();
            }
            PetProfileDoc passport = petProfileService.onboardPet(ownerUuid, basicProfile, profileVisibility, photos, videos, healthCertificate, breedCertificate);
            return ResponseEntity.ok(ApiResponse.success("Pet onboarded successfully", passport));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to onboard pet: " + e.getMessage()));
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<PetProfileDoc>>> getPetsByOwner(@PathVariable String ownerId) {
        try {
            UUID ownerUuid = parseOwnerUuid(ownerId);
            List<PetProfileDoc> pets = petProfileService.getPetsByOwnerId(ownerUuid);
            return ResponseEntity.ok(ApiResponse.success("Pets fetched successfully", pets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch pets: " + e.getMessage()));
        }
    }

    @GetMapping("/public/{qrHash}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resolvePublicProfile(
            @PathVariable String qrHash,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "requesterId", required = false) String requesterId) {
        try {
            String idToUse = headerUserId != null && !headerUserId.trim().isEmpty() ? headerUserId : requesterId;
            UUID requesterUuid = parseOwnerUuid(idToUse);
            Map<String, Object> data = qrService.resolveProfile(qrHash, requesterUuid, idToUse);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Pet profile not found for identifier: " + qrHash));
            }
            return ResponseEntity.ok(ApiResponse.success("Pet profile resolved", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to resolve pet profile: " + e.getMessage()));
        }
    }

    @GetMapping("/{petId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPetProfile(
            @PathVariable String petId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "requesterId", required = false) String requesterId) {
        try {
            String idToUse = headerUserId != null && !headerUserId.trim().isEmpty() ? headerUserId : requesterId;
            UUID requesterUuid = parseOwnerUuid(idToUse);
            Map<String, Object> data = qrService.resolveProfile(petId, requesterUuid, idToUse);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Pet profile not found for identifier: " + petId));
            }
            return ResponseEntity.ok(ApiResponse.success("Pet profile retrieved", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve pet profile: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/{petId}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetProfileDoc>> updatePetProfileMultipart(
            @PathVariable UUID petId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "ownerId", required = false) String ownerId,
            @RequestParam(value = "basicProfile", required = false) String basicProfileJson,
            @RequestParam(value = "profileVisibility", required = false) String profileVisibilityJson,
            @RequestParam(value = "emergencyContact", required = false) String emergencyContactJson,
            @RequestParam(value = "photos", required = false) List<String> photos,
            @RequestParam(value = "videos", required = false) List<String> videos,
            @RequestParam(value = "healthCertificate", required = false) MultipartFile healthCertificate,
            @RequestParam(value = "breedCertificate", required = false) MultipartFile breedCertificate) {
        try {
            String idToUse = headerUserId != null && !headerUserId.trim().isEmpty() ? headerUserId : ownerId;
            UUID requesterUuid = parseOwnerUuid(idToUse);

            PetProfileDoc.BasicProfile basicProfile = null;
            if (basicProfileJson != null && !basicProfileJson.trim().isEmpty()) {
                basicProfile = objectMapper.readValue(basicProfileJson, PetProfileDoc.BasicProfile.class);
            }

            PetProfileDoc.ProfileVisibility visibility = null;
            if (profileVisibilityJson != null && !profileVisibilityJson.trim().isEmpty()) {
                visibility = objectMapper.readValue(profileVisibilityJson, PetProfileDoc.ProfileVisibility.class);
            }

            PetProfileDoc.EmergencyContactOverride emergency = null;
            if (emergencyContactJson != null && !emergencyContactJson.trim().isEmpty()) {
                emergency = objectMapper.readValue(emergencyContactJson, PetProfileDoc.EmergencyContactOverride.class);
            }

            PetProfileDoc updated = petProfileService.updatePetProfile(
                    petId, requesterUuid, basicProfile, visibility, emergency, photos, videos, healthCertificate, breedCertificate);
            return ResponseEntity.ok(ApiResponse.success("Pet profile updated successfully", updated));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Failed to update pet profile: " + e.getMessage()));
        }
    }

    @PutMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetProfileDoc>> updatePetProfile(
            @PathVariable UUID petId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "ownerId", required = false) String ownerId,
            @RequestBody Map<String, Object> payload) {
        try {
            String idToUse = headerUserId != null && !headerUserId.trim().isEmpty() ? headerUserId : ownerId;
            UUID requesterUuid = parseOwnerUuid(idToUse);
            
            PetProfileDoc.BasicProfile basicProfile = null;
            if (payload.containsKey("basicProfile") && payload.get("basicProfile") != null) {
                basicProfile = objectMapper.convertValue(payload.get("basicProfile"), PetProfileDoc.BasicProfile.class);
            }
            PetProfileDoc.ProfileVisibility visibility = null;
            if (payload.containsKey("profileVisibility") && payload.get("profileVisibility") != null) {
                Object visObj = payload.get("profileVisibility");
                if (visObj instanceof Map<?, ?> map) {
                    visibility = new PetProfileDoc.ProfileVisibility();
                    if (map.containsKey("isPublic")) {
                        visibility.setIsPublic(Boolean.parseBoolean(String.valueOf(map.get("isPublic"))));
                    } else if (map.containsKey("public")) {
                        visibility.setIsPublic(Boolean.parseBoolean(String.valueOf(map.get("public"))));
                    }
                    if (map.containsKey("showPhysicalAttributes")) {
                        visibility.setShowPhysicalAttributes(Boolean.parseBoolean(String.valueOf(map.get("showPhysicalAttributes"))));
                    }
                    if (map.containsKey("showCertificates")) {
                        visibility.setShowCertificates(Boolean.parseBoolean(String.valueOf(map.get("showCertificates"))));
                    }
                    if (map.containsKey("showMedia")) {
                        visibility.setShowMedia(Boolean.parseBoolean(String.valueOf(map.get("showMedia"))));
                    }
                    if (map.containsKey("showMedicalRecords")) {
                        visibility.setShowMedicalRecords(Boolean.parseBoolean(String.valueOf(map.get("showMedicalRecords"))));
                    }
                } else {
                    visibility = objectMapper.convertValue(visObj, PetProfileDoc.ProfileVisibility.class);
                }
            }
            PetProfileDoc.EmergencyContactOverride emergency = null;
            if (payload.containsKey("emergencyContact") && payload.get("emergencyContact") != null) {
                emergency = objectMapper.convertValue(payload.get("emergencyContact"), PetProfileDoc.EmergencyContactOverride.class);
            }
            
            PetProfileDoc updated = petProfileService.updatePetProfile(petId, requesterUuid, basicProfile, visibility, emergency, null, null, null, null);
            return ResponseEntity.ok(ApiResponse.success("Pet profile updated successfully", updated));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Failed to update pet profile: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<String>> deletePetProfile(
            @PathVariable UUID petId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "ownerId", required = false) String ownerId) {
        try {
            String idToUse = headerUserId != null && !headerUserId.trim().isEmpty() ? headerUserId : ownerId;
            UUID requesterUuid = parseOwnerUuid(idToUse);
            petProfileService.deletePetProfile(petId, requesterUuid);
            return ResponseEntity.ok(ApiResponse.success("Pet profile deleted successfully", "Pet ID: " + petId));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Failed to delete pet profile: " + e.getMessage()));
        }
    }

    @GetMapping("/{petId}/secure-preview/{certificateType}")
    public ResponseEntity<?> securePreview(
            @PathVariable UUID petId, 
            @PathVariable String certificateType,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        try {
            PetProfileDoc passport = petProfileDocRepository.findById(petId)
                    .orElseThrow(() -> new RuntimeException("Pet not found with ID: " + petId));

            PetProfileDoc.DocumentType docType;
            try {
                docType = PetProfileDoc.DocumentType.valueOf(certificateType.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Invalid certificate type: " + certificateType));
            }
            
            String s3Key = null;
            if (passport.getMediaGallery() != null && passport.getMediaGallery().getDocuments() != null) {
                for (PetProfileDoc.ProfileDocument doc : passport.getMediaGallery().getDocuments()) {
                    if (doc.getDocumentType() == docType) {
                        s3Key = doc.getSecureS3Key();
                        break;
                    }
                }
            }

            if (s3Key == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("No " + certificateType + " was uploaded for this pet."));
            }

            byte[] docBytes = s3StorageService.getSecureDocumentBytes(s3Key);
            if (docBytes == null || docBytes.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Uploaded certificate file not found in storage."));
            }

            String contentType = s3StorageService.getDocumentContentType(s3Key);
            InputStreamResource resource = new InputStreamResource(new java.io.ByteArrayInputStream(docBytes));

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"certificate\"");
            headers.add(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to stream secure preview: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/qr/{qrHash}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQrCode(@PathVariable String qrHash) {
        try {
            // Generate QR linking to the frontend Profile page
            String profileUrl = "http://localhost:5173/Profile?hash=" + qrHash;
            
            com.google.zxing.qrcode.QRCodeWriter qrCodeWriter = new com.google.zxing.qrcode.QRCodeWriter();
            java.util.Map<com.google.zxing.EncodeHintType, Object> hints = new java.util.HashMap<>();
            hints.put(com.google.zxing.EncodeHintType.MARGIN, 1); // Minimize quiet zone white border box around QR
            hints.put(com.google.zxing.EncodeHintType.CHARACTER_SET, "UTF-8");
            
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(profileUrl, com.google.zxing.BarcodeFormat.QR_CODE, 300, 300, hints);
            
            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            com.google.zxing.client.j2se.MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, must-revalidate");
            return ResponseEntity.ok().headers(headers).body(pngData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
