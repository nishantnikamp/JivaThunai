package com.jivathunai.medical.health.dto;

import lombok.Data;

@Data
public class SubmitLocationEvidenceRequest {
    private String evidenceId;
    private String evidenceType; // BUILDING_SIGNAGE, ENTRANCE_PHOTO, REGISTRATION_DOC_ADDRESS, UTILITY_BILL
    private String fileUrl;
    private String reviewerNotes;
    private String reviewStatus; // PENDING, APPROVED, REJECTED
}
