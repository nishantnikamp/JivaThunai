package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument.DayOpeningHour;
import lombok.Data;
import java.util.List;

@Data
public class SaveOpeningHoursRequest {
    private List<DayOpeningHour> openingHours;
    private Boolean emergencySupport247;
    private String holidayExceptions;
}
