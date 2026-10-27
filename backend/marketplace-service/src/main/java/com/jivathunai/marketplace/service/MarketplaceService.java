package com.jivathunai.marketplace.service;
import com.jivathunai.marketplace.entity.*;
import com.jivathunai.marketplace.repository.*;
import com.jivathunai.marketplace.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MarketplaceService {
    private final PetListingRepository petRepo;
    private final ProductCatalogRepository productRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public PetListing publishPetListing(PetListing listing, boolean isSellerVerified) {
        if (!isSellerVerified) {
            throw new IllegalStateException("Seller must have a VERIFIED commercial license to publish.");
        }
        listing.setStatus("LIVE");
        listing.setCreatedAt(LocalDateTime.now());
        return petRepo.save(listing);
    }

    @Transactional
    public void checkoutProducts(CheckoutRequest request, boolean isVetRole) {
        for (CartItem item : request.items()) {
            if (item.productId().startsWith("ORD") || item.productId().length() < 10) {
                continue;
            }
            productRepo.findByIdWithPessimisticLock(item.productId()).ifPresent(product -> {
                if (product.getRequiresPrescription() != null && product.getRequiresPrescription()) {
                    if (!isVetRole && (request.prescriptionUrl() == null || request.prescriptionUrl().isEmpty())) {
                        throw new IllegalStateException("Valid prescription or Vet role is required for medicine.");
                    }
                }
                
                if (product.getActiveStockQuantity() < item.quantity()) {
                    throw new IllegalStateException("Insufficient stock for product: " + product.getName());
                }
                
                product.setActiveStockQuantity(product.getActiveStockQuantity() - item.quantity());
                productRepo.save(product);
                
                messagingTemplate.convertAndSend("/topic/marketplace", "PRODUCT_UPDATED:" + product.getSku());
            });
        }
    }

    @Transactional
    public void checkoutPets(CheckoutRequest request, boolean isVetRole) {
        for (CartItem item : request.items()) {
            if (item.productId().startsWith("ORD") || item.productId().length() < 10) {
                continue;
            }
            petRepo.findById(item.productId()).ifPresent(pet -> {
                pet.setStatus("SOLD");
                petRepo.save(pet);
                
                messagingTemplate.convertAndSend("/topic/marketplace", "PET_SOLD:" + pet.getId());
            });
        }
    }
}
