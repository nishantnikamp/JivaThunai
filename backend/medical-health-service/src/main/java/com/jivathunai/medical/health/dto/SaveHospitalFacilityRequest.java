package com.jivathunai.medical.health.dto;

import lombok.Data;

@Data
public class SaveHospitalFacilityRequest {
    private String facilityId;
    private String facilityName;
    private String type; // EMERGENCY_BED, ICU_BED, CONSULTATION_ROOM, RECOVERY_WARD, OPERATION_THEATRE, DIAGNOSTIC_IMAGING, PATHOLOGY_LAB, PHARMACY, AMBULANCE, WAITING_AREA
    private String branchId;
    private Integer capacity;
    private String supportedProcedures;
    private String operationalStatus; // OPERATIONAL, MAINTENANCE, CLEANING, UNAVAILABLE
    private String lastInspectedDate;
    private String inspectionStatus; // PASSED, PENDING, EXPIRED
    private Boolean published;
}
