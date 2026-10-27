package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.PetCareDelegation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetCareDelegationRepository extends MongoRepository<PetCareDelegation, String> {
    Optional<PetCareDelegation> findByDelegationId(UUID delegationId);
    Optional<PetCareDelegation> findByInvitationToken(String invitationToken);
    List<PetCareDelegation> findByOwnerUserIdOrderByCreatedAtDesc(UUID ownerUserId);
    List<PetCareDelegation> findByCaretakerUserIdAndDelegationStatus(UUID caretakerUserId, PetCareDelegation.DelegationStatus status);
    List<PetCareDelegation> findByCaretakerEmailAndDelegationStatus(String caretakerEmail, PetCareDelegation.DelegationStatus status);
    List<PetCareDelegation> findByPetId(UUID petId);
    List<PetCareDelegation> findByExpiresAtBeforeAndDelegationStatus(LocalDateTime now, PetCareDelegation.DelegationStatus status);
}
