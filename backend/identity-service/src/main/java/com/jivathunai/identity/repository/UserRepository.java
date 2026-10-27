package com.jivathunai.identity.repository;

import com.jivathunai.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    java.util.List<User> findByParentOrganizationId(Long parentOrganizationId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleName = :role")
    java.util.List<User> findByRoleName(@org.springframework.data.repository.query.Param("role") com.jivathunai.common.enums.SystemRole role);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleName = :role AND u.parentOrganization.id = :hospitalId")
    java.util.List<User> findByRoleNameAndParentOrganizationId(@org.springframework.data.repository.query.Param("role") com.jivathunai.common.enums.SystemRole role, @org.springframework.data.repository.query.Param("hospitalId") Long hospitalId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u LEFT JOIN u.roles r WHERE " +
           "(:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:role IS NULL OR r.roleName = :role)")
    Page<User> searchUsers(@org.springframework.data.repository.query.Param("search") String search, 
                           @org.springframework.data.repository.query.Param("role") com.jivathunai.common.enums.SystemRole role, 
                           Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startOfDay")
    long countSignupsSince(@org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay);

    @org.springframework.data.jpa.repository.Query("SELECT r.roleName, COUNT(u) FROM User u JOIN u.roles r GROUP BY r.roleName")
    java.util.List<Object[]> countUsersByRole();
}

