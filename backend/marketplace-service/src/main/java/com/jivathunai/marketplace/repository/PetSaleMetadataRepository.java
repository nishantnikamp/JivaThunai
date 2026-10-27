package com.jivathunai.marketplace.repository;

import com.jivathunai.marketplace.document.PetSaleMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PetSaleMetadataRepository extends MongoRepository<PetSaleMetadata, String> {
    Optional<PetSaleMetadata> findByListingId(String listingId);
}
