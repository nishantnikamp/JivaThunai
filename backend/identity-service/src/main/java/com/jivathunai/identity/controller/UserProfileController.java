package com.jivathunai.identity.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.identity.dto.ProfileResponse;
import com.jivathunai.identity.dto.ProfileUpdateRequest;
import com.jivathunai.identity.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * User profile management controller
 */
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Object>> getProfile(@PathVariable("userId") Long userId) {
        try {
            ProfileResponse response = userProfileService.getProfile(userId);
            return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "none")));
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<Object>> updateProfile(@PathVariable("userId") Long userId, @RequestBody ProfileUpdateRequest request) {
        try {
            ProfileResponse response = userProfileService.updateProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/{userId}/photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Object>> uploadPhoto(@PathVariable("userId") Long userId, @RequestParam("photo") org.springframework.web.multipart.MultipartFile photo) {
        try {
            userProfileService.uploadPhoto(userId, photo);
            return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully", null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/photo")
    public ResponseEntity<?> getPhoto(@PathVariable("userId") Long userId) {
        try {
            byte[] photo = userProfileService.getPhoto(userId);
            if (photo == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                    .body(photo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{userId}/documents", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Object>> uploadDocuments(
            @PathVariable("userId") Long userId, 
            @RequestParam(value = "clinicalLicense", required = false) org.springframework.web.multipart.MultipartFile clinicalLicense,
            @RequestParam(value = "gstRegistration", required = false) org.springframework.web.multipart.MultipartFile gstRegistration) {
        try {
            userProfileService.uploadDocuments(userId, clinicalLicense, gstRegistration);
            return ResponseEntity.ok(ApiResponse.success("Documents uploaded successfully", null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/documents/{docType}")
    public ResponseEntity<?> getDocument(@PathVariable("userId") Long userId, @PathVariable("docType") String docType) {
        try {
            byte[] doc = userProfileService.getDocument(userId, docType);
            if (doc == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(doc);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/veterinary-hospitals")
    public ResponseEntity<ApiResponse<Object>> getVeterinaryHospitals() {
        try {
            var hospitals = userProfileService.getVeterinaryHospitals();
            return ResponseEntity.ok(ApiResponse.success("Veterinary admin hospitals directory retrieved", hospitals));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/veterinary-doctors")
    public ResponseEntity<ApiResponse<Object>> getVeterinaryDoctors(@RequestParam(value = "hospitalId", required = false) String hospitalId) {
        try {
            var doctors = userProfileService.getVeterinaryDoctors(hospitalId);
            return ResponseEntity.ok(ApiResponse.success("Attending veterinary doctors retrieved", doctors));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
}

