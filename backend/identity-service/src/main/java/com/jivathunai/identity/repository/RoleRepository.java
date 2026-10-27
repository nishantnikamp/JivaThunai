package com.jivathunai.identity.repository;

import com.jivathunai.common.enums.SystemRole;
import com.jivathunai.identity.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(SystemRole roleName);
}
