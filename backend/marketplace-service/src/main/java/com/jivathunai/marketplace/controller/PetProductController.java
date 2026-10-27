package com.jivathunai.marketplace.controller;

import com.jivathunai.marketplace.entity.ProductCatalog;
import com.jivathunai.marketplace.repository.ProductCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.jivathunai.marketplace.service.MarketplaceService;

@RestController
@RequestMapping("/api/v1/petproduct")
@RequiredArgsConstructor
public class PetProductController {
    
    private final ProductCatalogRepository prodRepo;
    private final MarketplaceService marketplaceService;

    @GetMapping
    public ResponseEntity<List<ProductCatalog>> getProducts(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) java.math.BigDecimal maxPrice,
            @RequestParam(name = "species", required = false) String species) {
        if (category == null && minPrice == null && maxPrice == null && species == null) {
            return ResponseEntity.ok(prodRepo.findAll());
        } else {
            String finalCategory = category != null ? category : "";
            String finalSpecies = species != null ? species : "";
            java.math.BigDecimal finalMin = minPrice != null ? minPrice : java.math.BigDecimal.ZERO;
            java.math.BigDecimal finalMax = maxPrice != null ? maxPrice : new java.math.BigDecimal("999999999.00");
            return ResponseEntity.ok(prodRepo.findWithFilters(finalCategory, finalMin, finalMax, finalSpecies));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductCatalog product, @RequestHeader(value="X-User-Roles", defaultValue="") String roles) {
        if (!roles.contains("SUPER_ADMIN") && !roles.contains("PRODUCT_SHOP_OWNER") && !roles.contains("ADMIN") && !roles.contains("SELLER")) {
            return ResponseEntity.status(403).body("Not authorized to manage products.");
        }
        return ResponseEntity.ok(prodRepo.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody ProductCatalog updates, @RequestHeader(value="X-User-Roles", defaultValue="") String roles) {
        if (!roles.contains("SUPER_ADMIN") && !roles.contains("PRODUCT_SHOP_OWNER") && !roles.contains("ADMIN") && !roles.contains("SELLER")) {
            return ResponseEntity.status(403).body("Unauthorized.");
        }
        return prodRepo.findById(id).map(existing -> {
            // Because we want a full update mapping for the edited product
            existing.setName(updates.getName());
            existing.setRetailPrice(updates.getRetailPrice());
            existing.setActiveStockQuantity(updates.getActiveStockQuantity());
            
            // Add other fields that might be updated
            existing.setDescription(updates.getDescription());
            existing.setBrand(updates.getBrand());
            existing.setPhotoUrl(updates.getPhotoUrl());
            existing.setPhotos(updates.getPhotos());
            existing.setVideos(updates.getVideos());
            existing.setCategoryId(updates.getCategoryId());
            existing.setDiscountedActivePrice(updates.getDiscountedActivePrice());
            
            // Full update
            existing.setBarcode(updates.getBarcode());
            existing.setBaseCostPrice(updates.getBaseCostPrice());
            existing.setGstPercentageRate(updates.getGstPercentageRate());
            existing.setMaximumOrderQuantityLimit(updates.getMaximumOrderQuantityLimit());
            existing.setIsScheduledDrugFlag(updates.getIsScheduledDrugFlag());
            existing.setManufacturingDate(updates.getManufacturingDate());
            existing.setExpiryDate(updates.getExpiryDate());
            existing.setNetWeightGrams(updates.getNetWeightGrams());
            existing.setLength(updates.getLength());
            existing.setWidth(updates.getWidth());
            existing.setHeight(updates.getHeight());
            
            existing.setCrudeProteinPercentage(updates.getCrudeProteinPercentage());
            existing.setCrudeFatPercentage(updates.getCrudeFatPercentage());
            existing.setCrudeFiberPercentage(updates.getCrudeFiberPercentage());
            existing.setIngredientsManifest(updates.getIngredientsManifest());
            existing.setDosagePerKgMetric(updates.getDosagePerKgMetric());
            existing.setContraindicationsText(updates.getContraindicationsText());
            existing.setStorageConditionInstructions(updates.getStorageConditionInstructions());
            existing.setApis(updates.getApis());
            
            return ResponseEntity.ok(prodRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id, @RequestHeader(value="X-User-Roles", defaultValue="") String roles) {
        if (!roles.contains("SUPER_ADMIN") && !roles.contains("ADMIN") && !roles.contains("PRODUCT_SHOP_OWNER")) {
            return ResponseEntity.status(403).body("Unauthorized.");
        }
        prodRepo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutProducts(@RequestBody com.jivathunai.marketplace.dto.CheckoutRequest req, @RequestHeader(value="X-User-Roles", defaultValue="") String roles) {
        try {
            boolean isVet = roles.contains("VETERINARY_DOCTOR") || roles.contains("VET");
            marketplaceService.checkoutProducts(req, isVet);
            return ResponseEntity.ok("Product Checkout successful, inventory updated.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
