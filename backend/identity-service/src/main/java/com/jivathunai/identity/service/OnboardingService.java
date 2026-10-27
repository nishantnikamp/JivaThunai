package com.jivathunai.identity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jivathunai.common.enums.SystemRole;
import com.jivathunai.common.enums.KycStatus;
import com.jivathunai.identity.dto.*;
import com.jivathunai.identity.entity.Role;
import com.jivathunai.identity.entity.RoleApplication;
import com.jivathunai.identity.entity.User;
import com.jivathunai.identity.repository.RoleApplicationRepository;
import com.jivathunai.identity.repository.RoleRepository;
import com.jivathunai.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;


@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleApplicationRepository roleApplicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Transactional
    public void registerPolymorphic(RegistrationRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (userRepository.findByPhone(request.phonePrimary()).isPresent()) {
            throw new IllegalArgumentException("Phone number is already in use");
        }

        User user = new User();
        user.setFullName(request.name());
        user.setEmail(request.email());
        user.setPhone(request.phonePrimary());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setKycStatus(KycStatus.NOT_SUBMITTED);
        user.setEmailVerified(false);
        user.setPhoneVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Standard Default Role
        Set<Role> assignedRoles = new HashSet<>();
        assignedRoles.add(getOrCreateRole(SystemRole.PET_OWNER));
        user.setRoles(assignedRoles);

        String generatedOtp = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setCurrentOtp(generatedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);

        // Process conditional requested roles via Role Applications
        if (request.requestedRoles() != null) {
            for (SystemRole requestedRole : request.requestedRoles()) {
                if (requestedRole == SystemRole.PET_OWNER) continue;
                
                // Match the profile payload from roleProfiles
                RoleProfile matchedProfile = findMatchingProfileForRole(request, requestedRole);
                
                RoleApplication app = new RoleApplication();
                app.setUser(user);
                app.setRequestedRole(requestedRole);
                app.setApplicationStatus("PENDING_APPROVAL");
                
                if (matchedProfile != null) {
                    try {
                        app.setConditionalProfilePayload(objectMapper.writeValueAsString(matchedProfile));
                    } catch (JsonProcessingException e) {
                        log.error("Failed to serialize role profile", e);
                        throw new IllegalArgumentException("Invalid role profile data format");
                    }
                }
                roleApplicationRepository.save(app);
            }
        }
        
        log.info("Inner mock OTP dispatched for user {}: {}", user.getEmail(), generatedOtp);
    }

    @Transactional
    public void upgradeRole(Long userId, RoleUpgradeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        RoleApplication app = new RoleApplication();
        app.setUser(user);
        app.setRequestedRole(request.requestedRole());
        app.setApplicationStatus("PENDING_APPROVAL");

        if (request.roleProfile() != null) {
            try {
                app.setConditionalProfilePayload(objectMapper.writeValueAsString(request.roleProfile()));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize role profile", e);
                throw new IllegalArgumentException("Invalid role profile data format");
            }
        }
        roleApplicationRepository.save(app);
    }

    private RoleProfile findMatchingProfileForRole(RegistrationRequest request, SystemRole role) {
        if (request.roleProfiles() == null) return null;
        
        return request.roleProfiles().stream().filter(profile -> {
            if (role == SystemRole.VETERINARY_DOCTOR && profile instanceof ClinicDetails) return true;
            if ((role == SystemRole.SELLER || role == SystemRole.PRODUCT_SHOP_OWNER || role == SystemRole.NGO_SHELTER) 
                    && profile instanceof BusinessLicenseDetails) return true;
            if (role == SystemRole.CARETAKER && profile instanceof FacilityDetails) return true;
            return false;
        }).findFirst().orElse(null);
    }

    private Role getOrCreateRole(SystemRole systemRole) {
        return roleRepository.findByRoleName(systemRole)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName(systemRole);
                    return roleRepository.save(r);
                });
    }
}
