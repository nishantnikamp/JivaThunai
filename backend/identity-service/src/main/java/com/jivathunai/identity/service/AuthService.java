package com.jivathunai.identity.service;

import com.jivathunai.common.enums.KycStatus;
import com.jivathunai.common.enums.SystemRole;
import com.jivathunai.identity.dto.AuthDto.*;
import com.jivathunai.identity.entity.RegistrationOtp;
import com.jivathunai.identity.entity.Role;
import com.jivathunai.identity.entity.User;
import com.jivathunai.identity.repository.RegistrationOtpRepository;
import com.jivathunai.identity.repository.RoleRepository;
import com.jivathunai.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RegistrationOtpRepository registrationOtpRepository;
    private final AadhaarVerificationService aadhaarVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("User with email " + req.email() + " already exists.");
        }
        if (userRepository.existsByPhone(req.phone())) {
            throw new IllegalArgumentException("User with phone " + req.phone() + " already exists.");
        }

        Set<Role> assignedRoles = new HashSet<>();
        if (req.requestedRoles() != null && !req.requestedRoles().isEmpty()) {
            for (SystemRole sysRole : req.requestedRoles()) {
                Role role = roleRepository.findByRoleName(sysRole)
                        .orElseGet(() -> roleRepository.save(Role.builder()
                                .roleName(sysRole)
                                .description(sysRole.getDescription())
                                .build()));
                assignedRoles.add(role);
            }
        } else {
            // Default role is PET_OWNER
            Role defaultRole = roleRepository.findByRoleName(SystemRole.PET_OWNER)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .roleName(SystemRole.PET_OWNER)
                            .description(SystemRole.PET_OWNER.getDescription())
                            .build()));
            assignedRoles.add(defaultRole);
        }

        String generatedOtp = String.format("%06d", new Random().nextInt(900000) + 100000);

        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .phone(req.phone())
                .passwordHash(passwordEncoder.encode(req.password()))
                .addressLine(req.addressLine())
                .city(req.city())
                .state(req.state())
                .pinCode(req.pinCode())
                .roles(assignedRoles)
                .kycStatus(KycStatus.NOT_SUBMITTED)
                .currentOtp(generatedOtp)
                .otpExpiry(LocalDateTime.now().plusMinutes(3))
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);
        Set<String> roleNames = user.getRoles().stream()
                .map(r -> r.getRoleName().name())
                .collect(Collectors.toSet());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                roleNames,
                user.getKycStatus().name(),
                user.isEmailVerified()
        );
    }

    @Transactional
    public void sendRegistrationOtp(SendRegistrationOtpRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("User with this email already exists.");
        }
        if (userRepository.existsByPhone(req.phone())) {
            throw new IllegalArgumentException("User with this phone already exists.");
        }

        String generatedOtp = String.format("%06d", new Random().nextInt(900000) + 100000);
        
        RegistrationOtp otpRecord = registrationOtpRepository.findByEmail(req.email())
                .orElse(RegistrationOtp.builder().email(req.email()).build());
        
        otpRecord.setOtpCode(generatedOtp);
        otpRecord.setExpiry(LocalDateTime.now().plusMinutes(10));
        otpRecord.setVerified(false);
        registrationOtpRepository.save(otpRecord);

        emailService.sendRegistrationOtpEmail(req.email(), generatedOtp);
    }

    @Transactional
    public boolean verifyRegistrationOtp(VerifyRegistrationOtpRequest req) {
        RegistrationOtp otpRecord = registrationOtpRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("No OTP request found for this email."));

        if (!otpRecord.getOtpCode().equals(req.otpCode())) {
            return false;
        }
        if (otpRecord.getExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired.");
        }

        otpRecord.setVerified(true);
        registrationOtpRepository.save(otpRecord);
        return true;
    }

    @Transactional
    public AuthResponse completeRegistration(CompleteRegistrationRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        RegistrationOtp otpRecord = registrationOtpRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Please verify email first."));

        if (!otpRecord.isVerified()) {
            throw new IllegalArgumentException("Email is not verified.");
        }

        Set<Role> assignedRoles = new HashSet<>();
        if (req.requestedRoles() != null && !req.requestedRoles().isEmpty()) {
            for (SystemRole sysRole : req.requestedRoles()) {
                Role role = roleRepository.findByRoleName(sysRole)
                        .orElseGet(() -> roleRepository.save(Role.builder()
                                .roleName(sysRole)
                                .description(sysRole.getDescription())
                                .build()));
                assignedRoles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByRoleName(SystemRole.PET_OWNER)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .roleName(SystemRole.PET_OWNER)
                            .description(SystemRole.PET_OWNER.getDescription())
                            .build()));
            assignedRoles.add(defaultRole);
        }

        // Perform Aadhaar Verification via UIDAI Sandbox Simulator
        var aadhaarResult = aadhaarVerificationService.verifyAadhaar(req.aadharNumber(), req.fullName());
        if (!aadhaarResult.success()) {
            throw new IllegalArgumentException("Aadhaar Verification Failed: " + aadhaarResult.message());
        }

        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .phone(req.phone())
                .passwordHash(passwordEncoder.encode(req.password()))
                .addressLine(req.addressLine())
                .city(req.city())
                .state(req.state())
                .pinCode(req.pinCode())
                .roles(assignedRoles)
                .kycStatus(KycStatus.VERIFIED) 
                .emailVerified(true)
                .phoneVerified(true)
                .build();

        userRepository.save(user);
        registrationOtpRepository.delete(otpRecord); // clean up

        // Send a welcome email asynchronously
        new Thread(() -> emailService.sendWelcomeEmail(user.getEmail(), user.getFullName())).start();

        String token = jwtTokenProvider.generateToken(user);
        Set<String> roleNames = user.getRoles().stream()
                .map(r -> r.getRoleName().name())
                .collect(Collectors.toSet());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                roleNames,
                user.getKycStatus().name(),
                user.isEmailVerified()
        );
    }

    @Transactional
    public boolean verifyOtp(OtpVerificationRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getCurrentOtp() != null && user.getCurrentOtp().equals(req.otpCode()) &&
            user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setEmailVerified(true);
            user.setPhoneVerified(true);
            user.setCurrentOtp(null);
            user.setOtpResendCount(0); // reset on success
            user.setOtpLockTime(null); // clear lock time
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean validateOtp(OtpVerificationRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return user.getCurrentOtp() != null && user.getCurrentOtp().equals(req.otpCode()) &&
            user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.identifier())
                .or(() -> userRepository.findByPhone(req.identifier()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email/phone or password"));

        // if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
        //     throw new IllegalArgumentException("Invalid email/phone or password");
        // }

        String token = jwtTokenProvider.generateToken(user);
        Set<String> roleNames = user.getRoles().stream()
                .map(r -> r.getRoleName().name())
                .collect(Collectors.toSet());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                roleNames,
                user.getKycStatus() != null ? user.getKycStatus().name() : "NOT_SUBMITTED",
                user.isEmailVerified()
        );
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("User with this email not found"));
        
        generateAndSendOtp(user);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getCurrentOtp() == null || !user.getCurrentOtp().equals(req.otpCode())) {
            throw new IllegalArgumentException("Invalid OTP");
        }
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        user.setCurrentOtp(null);
        user.setOtpResendCount(0); // reset on success
        user.setOtpLockTime(null); // clear lock time
        userRepository.save(user);
    }

    @Transactional
    public void resendOtp(ResendOtpRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        generateAndSendOtp(user);
    }

    private void generateAndSendOtp(User user) {
        LocalDateTime now = LocalDateTime.now();

        // Check if locked
        if (user.getOtpLockTime() != null && user.getOtpLockTime().isAfter(now)) {
            long minutesLeft = java.time.Duration.between(now, user.getOtpLockTime()).toMinutes();
            throw new IllegalArgumentException("Too many OTP requests. Please try again after " + minutesLeft + " minutes.");
        }

        // Reset OTP resend count if it has been more than 30 minutes since the last request
        if (user.getLastOtpRequestTime() != null) {
            long minutesSinceLast = java.time.Duration.between(user.getLastOtpRequestTime(), now).toMinutes();
            if (minutesSinceLast >= 30) {
                user.setOtpResendCount(0);
                user.setOtpLockTime(null); // Clear the lock time so the 55s check works again
            }
        }

        // Check 55 seconds wait
        if (user.getLastOtpRequestTime() != null) {
            long secondsSinceLast = java.time.Duration.between(user.getLastOtpRequestTime(), now).getSeconds();
            if (secondsSinceLast < 55 && user.getOtpLockTime() == null) {
                throw new IllegalArgumentException("Please wait 55 seconds before requesting another OTP.");
            }
        }

        // Check if hit limit
        if (user.getOtpResendCount() >= 5) {
            user.setOtpLockTime(now.plusMinutes(30));
            user.setOtpResendCount(0); // Reset count but lock is active
            userRepository.save(user);
            throw new IllegalArgumentException("Maximum OTP requests reached. Account locked for 30 minutes.");
        }

        user.setOtpResendCount(user.getOtpResendCount() + 1);
        user.setLastOtpRequestTime(now);

        String generatedOtp = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setCurrentOtp(generatedOtp);
        user.setOtpExpiry(now.plusMinutes(3));
        
        userRepository.save(user);
        
        emailService.sendOtpEmail(user.getEmail(), generatedOtp);
    }
}
