package com.jivathunai.adoption.repository;
import com.jivathunai.adoption.document.AdoptionPetMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface AdoptionPetMetadataRepository extends MongoRepository<AdoptionPetMetadata, String> {}
