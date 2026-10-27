package com.jivathunai.medical.health.repository.mysql;

import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VetStaffRegistryRepository extends JpaRepository<VetStaffRegistry, UUID> {

    Optional<VetStaffRegistry> findByUserId(UUID userId);

    Optional<VetStaffRegistry> findByUserIdAndEmploymentStatus(UUID userId, VetStaffRegistry.EmploymentStatus status);

    List<VetStaffRegistry> findByParentOrganization_OrganizationId(UUID organizationId);

    List<VetStaffRegistry> findByAssignedSystemRoleAndEmploymentStatus(
            VetStaffRegistry.SystemRole role,
            VetStaffRegistry.EmploymentStatus status
    );
}
