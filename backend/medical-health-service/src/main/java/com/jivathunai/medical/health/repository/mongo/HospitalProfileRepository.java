package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.HospitalProfileDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalProfileRepository extends MongoRepository<HospitalProfileDocument, String> {
    Optional<HospitalProfileDocument> findByOrganizationId(UUID organizationId);
    Optional<HospitalProfileDocument> findBySlug(String slug);
    List<HospitalProfileDocument> findByStatus(HospitalProfileDocument.ProfileStatus status);
}
