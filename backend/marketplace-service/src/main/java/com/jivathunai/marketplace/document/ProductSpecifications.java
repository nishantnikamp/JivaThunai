package com.jivathunai.marketplace.document;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecifications {
    private List<String> ingredientsManifest;
    private String description;
    private Map<String, String> nutritionalAnalysis;
}
