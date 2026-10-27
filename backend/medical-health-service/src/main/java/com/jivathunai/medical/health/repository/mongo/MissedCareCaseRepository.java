package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.MissedCareCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MissedCareCaseRepository extends MongoRepository<MissedCareCase, String> {
    Optional<MissedCareCase> findByCaseId(UUID caseId);
    Optional<MissedCareCase> findByCareTaskIdAndCaseStatusNot(UUID careTaskId, MissedCareCase.CaseStatus status);
    List<MissedCareCase> findByOwnerIdOrderByDetectedAtDesc(UUID ownerId);
    List<MissedCareCase> findByPetIdOrderByDetectedAtDesc(UUID petId);
    List<MissedCareCase> findByCaseStatus(MissedCareCase.CaseStatus caseStatus);
}
