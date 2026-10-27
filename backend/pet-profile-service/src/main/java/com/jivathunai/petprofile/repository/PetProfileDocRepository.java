package com.jivathunai.petprofile.repository;

import com.jivathunai.petprofile.document.PetProfileDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetProfileDocRepository extends MongoRepository<PetProfileDoc, UUID> {
    Optional<PetProfileDoc> findByQrProfileMetadata_QrCodePayloadString(String qrCodePayloadString);
}
