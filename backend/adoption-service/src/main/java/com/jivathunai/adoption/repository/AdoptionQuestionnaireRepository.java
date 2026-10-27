package com.jivathunai.adoption.repository;

import com.jivathunai.adoption.document.AdoptionQuestionnaire;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionQuestionnaireRepository extends MongoRepository<AdoptionQuestionnaire, String> {
    Optional<AdoptionQuestionnaire> findByApplicantIdAndPetId(Long applicantId, Long petId);
}
