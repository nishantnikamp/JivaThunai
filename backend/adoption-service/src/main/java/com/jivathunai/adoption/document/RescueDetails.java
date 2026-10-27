package com.jivathunai.adoption.document;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueDetails {
    private List<Double> geoCoordinates; // [longitude, latitude]
    private String foundLocationText;
    private String initialHealthState;
}
