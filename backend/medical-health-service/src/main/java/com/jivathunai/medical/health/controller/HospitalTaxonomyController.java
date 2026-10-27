package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.entity.mongo.HospitalTaxonomy;
import com.jivathunai.medical.health.entity.mongo.HospitalTaxonomy.TaxonomyItem;
import com.jivathunai.medical.health.service.HospitalTaxonomyService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/medical/taxonomies")
@RequiredArgsConstructor
@Slf4j
public class HospitalTaxonomyController {

    private final HospitalTaxonomyService taxonomyService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<TaxonomyItem>>>> getAllTaxonomies() {
        Map<String, List<TaxonomyItem>> all = taxonomyService.getAllTaxonomies();
        return ResponseEntity.ok(ApiResponse.success("Hospital taxonomies retrieved successfully", all));
    }

    @GetMapping("/{category}")
    public ResponseEntity<ApiResponse<List<TaxonomyItem>>> getTaxonomyCategory(@PathVariable String category) {
        List<TaxonomyItem> items = taxonomyService.getTaxonomyItems(category.toUpperCase());
        return ResponseEntity.ok(ApiResponse.success("Taxonomy items retrieved successfully", items));
    }

    @PostMapping("/{category}")
    public ResponseEntity<ApiResponse<TaxonomyItem>> addTaxonomyItem(
            @PathVariable String category,
            @RequestBody AddItemRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        TaxonomyItem created = taxonomyService.addItem(
                category.toUpperCase(),
                request.getLabel(),
                request.getCode(),
                request.getIcon(),
                request.getDescription(),
                userId
        );
        return ResponseEntity.ok(ApiResponse.success("Taxonomy item added successfully", created));
    }

    @Data
    public static class AddItemRequest {
        private String label;
        private String code;
        private String icon;
        private String description;
    }
}
