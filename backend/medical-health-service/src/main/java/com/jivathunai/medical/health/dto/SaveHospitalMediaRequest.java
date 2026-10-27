package com.jivathunai.medical.health.dto;

import lombok.Data;

@Data
public class SaveHospitalMediaRequest {
    private String mediaId;
    private String url;
    private String caption;
    private String category; // EXTERIOR, RECEPTION, CONSULTATION_ROOM, WARD, ICU, SURGERY, LABORATORY, EQUIPMENT, TEAM, SERVICE_VIDEO, OTHER
    private Boolean isPrimary;
    private Boolean isPublic;
    private String branchId;
}
