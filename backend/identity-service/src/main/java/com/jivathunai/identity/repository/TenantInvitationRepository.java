package com.jivathunai.identity.repository;

import com.jivathunai.identity.entity.TenantInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TenantInvitationRepository extends JpaRepository<TenantInvitation, Long> {
    Optional<TenantInvitation> findByToken(String token);
    java.util.List<TenantInvitation> findByInvitedByIdAndUsedFalse(Long invitedById);
    Optional<TenantInvitation> findByEmailAndInvitedByIdAndUsedFalse(String email, Long invitedById);
}
