package com.jivathunai.medical.health.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveHospitalServiceRequest {
    private String serviceId;
    private String serviceName;
    private String category; // CONSULTATION, PREVENTIVE_CARE, DIAGNOSTICS, SURGERY, EMERGENCY, INPATIENT_CARE, PHARMACY, GROOMING, TELECONSULTATION, HOME_SERVICES
    private String description;
    private List<String> supportedSpecies;
    private String branchId;
    private Double price;
    private String priceRange;
    private String currency;
    private Double consultationFee;
    private Integer typicalDurationMinutes;
    private Boolean walkInSupported;
    private Boolean emergencySupported;
    private Boolean referralRequired;
    private String requiredEquipment;
    private Boolean published;
}
