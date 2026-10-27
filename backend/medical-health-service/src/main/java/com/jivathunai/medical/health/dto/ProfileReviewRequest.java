package com.jivathunai.medical.health.dto;

import lombok.Data;

@Data
public class ProfileReviewRequest {
    private String decision; // APPROVED, CHANGES_REQUESTED, REJECTED
    private String scope; // FULL_PROFILE, LOCATION_ONLY, CREDENTIALS_ONLY
    private String reviewerNotes;
}
