package com.jivathunai.identity.service;

import com.jivathunai.common.enums.SystemRole;
import com.jivathunai.identity.entity.Role;
import com.jivathunai.identity.entity.User;
import com.jivathunai.identity.repository.RoleRepository;
import com.jivathunai.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final com.jivathunai.identity.repository.SystemSettingRepository systemSettingRepository;

    public Page<Map<String, Object>> getAllUsers(int page, int size, String search, String role) {
        int pageIndex = page > 0 ? page - 1 : 0;
        PageRequest pageRequest = PageRequest.of(pageIndex, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> usersPage;
        
        SystemRole roleEnum = null;
        if (role != null && !role.trim().isEmpty()) {
            try {
                roleEnum = SystemRole.valueOf(role);
            } catch (Exception e) {
                // Ignore invalid role
            }
        }
        
        if ((search != null && !search.trim().isEmpty()) || roleEnum != null) {
            usersPage = userRepository.searchUsers(
                    (search != null && !search.trim().isEmpty()) ? search : null, 
                    roleEnum, 
                    pageRequest);
        } else {
            usersPage = userRepository.findAll(pageRequest);
        }

        return usersPage.map(user -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", user.getId());
            dto.put("fullName", user.getFullName());
            dto.put("email", user.getEmail());
            dto.put("phone", user.getPhone());
            dto.put("addressLine", user.getAddressLine());
            dto.put("city", user.getCity());
            dto.put("state", user.getState());
            dto.put("pinCode", user.getPinCode());
            dto.put("kycStatus", user.getKycStatus() != null ? user.getKycStatus().name() : "NOT_SUBMITTED");
            dto.put("roles", user.getRoles().stream().map(r -> r.getRoleName().name()).collect(Collectors.toList()));
            dto.put("parentOrganizationId", user.getParentOrganization() != null ? user.getParentOrganization().getId() : null);
            dto.put("parentOrganizationName", user.getParentOrganization() != null ? user.getParentOrganization().getFullName() : null);
            dto.put("createdAt", user.getCreatedAt());
            return dto;
        });
    }

    public Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        long totalUsers = userRepository.count();
        metrics.put("totalUsers", totalUsers);
        
        java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now().with(java.time.LocalTime.MIN);
        long newSignupsToday = userRepository.countSignupsSince(startOfDay);
        metrics.put("newSignupsToday", newSignupsToday);
        
        List<Object[]> roleCounts = userRepository.countUsersByRole();
        Map<String, Long> roleDistribution = new HashMap<>();
        for (Object[] row : roleCounts) {
            SystemRole r = (SystemRole) row[0];
            Long count = (Long) row[1];
            roleDistribution.put(r.name(), count);
        }
        metrics.put("roleDistribution", roleDistribution);
        
        return metrics;
    }

    @Transactional
    public void updateUserRoles(Long userId, List<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<Role> newRoles = roleNames.stream().map(roleStr -> {
            SystemRole systemRole;
            try {
                systemRole = SystemRole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + roleStr);
            }
            return roleRepository.findByRoleName(systemRole).orElseGet(() -> {
                Role r = new Role();
                r.setRoleName(systemRole);
                return roleRepository.save(r);
            });
        }).collect(Collectors.toSet());

        // Always keep PET_OWNER
        boolean hasPetOwner = newRoles.stream().anyMatch(r -> r.getRoleName() == SystemRole.PET_OWNER);
        if (!hasPetOwner) {
            Role petOwnerRole = roleRepository.findByRoleName(SystemRole.PET_OWNER).orElseGet(() -> {
                Role r = new Role();
                r.setRoleName(SystemRole.PET_OWNER);
                return roleRepository.save(r);
            });
            newRoles.add(petOwnerRole);
        }

        user.setRoles(newRoles);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserKycStatus(Long userId, com.jivathunai.common.enums.KycStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        user.setKycStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void updateUser(Long userId, Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (updates.containsKey("fullName")) user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("email")) user.setEmail((String) updates.get("email"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("addressLine")) user.setAddressLine((String) updates.get("addressLine"));
        if (updates.containsKey("city")) user.setCity((String) updates.get("city"));
        if (updates.containsKey("state")) user.setState((String) updates.get("state"));
        if (updates.containsKey("pinCode")) user.setPinCode((String) updates.get("pinCode"));
        if (updates.containsKey("kycStatus")) {
            try {
                user.setKycStatus(com.jivathunai.common.enums.KycStatus.valueOf(String.valueOf(updates.get("kycStatus"))));
            } catch (Exception ignored) {}
        }
        
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        // In a real application, you might want to perform a soft delete
        // or cascade delete related records (pets, appointments, etc.) before deleting the user.
        userRepository.deleteById(userId);
    }

    public String getSystemSetting(String key, String defaultValue) {
        return systemSettingRepository.findById(key)
                .map(com.jivathunai.identity.entity.SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void updateSystemSetting(String key, String value) {
        com.jivathunai.identity.entity.SystemSetting setting = systemSettingRepository.findById(key)
                .orElseGet(() -> com.jivathunai.identity.entity.SystemSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        systemSettingRepository.save(setting);
    }
}
