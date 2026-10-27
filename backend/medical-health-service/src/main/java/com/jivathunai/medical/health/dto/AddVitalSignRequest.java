package com.jivathunai.medical.health.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddVitalSignRequest {

    private Double weightKg;
    private Double temperatureCelsius;
    private Integer heartRateBpm;
    private Integer respirationRateBpm;
    private UUID recordedByDoctorId;
    private String doctorName;
}
