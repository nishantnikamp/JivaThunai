package com.jivathunai.marketplace.repository.mongo;
import com.jivathunai.marketplace.document.PetListingMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PetListingMetadataRepository extends MongoRepository<PetListingMetadata, String> {}
