package com.jivathunai.medical.health.repository.mysql;

import com.jivathunai.medical.health.entity.mysql.VetOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VetOrganizationRepository extends JpaRepository<VetOrganization, UUID> {
    List<VetOrganization> findByKycStatus(VetOrganization.KycStatus status);
}
