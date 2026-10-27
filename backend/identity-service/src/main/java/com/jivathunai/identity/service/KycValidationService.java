package com.jivathunai.identity.service;

import com.jivathunai.identity.entity.UserProfile;
import com.jivathunai.identity.entity.HouseholdEvaluation;
import com.jivathunai.identity.enums.KycStatus;
import com.jivathunai.identity.dto.UserProfileDto;
import com.jivathunai.identity.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycValidationService {

    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public boolean isUserKycApproved(UUID userId) {
        return userProfileRepository.findById(userId)
                .map(user -> user.getKycStatus() == KycStatus.APPROVED)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean verifyTradeCapability(UUID buyerId, UUID sellerId) {
        boolean isBuyerApproved = isUserKycApproved(buyerId);
        boolean isSellerApproved = isUserKycApproved(sellerId);

        if (!isBuyerApproved) {
            log.warn("Trade Blocked: Buyer {} KYC is not APPROVED", buyerId);
        }
        if (!isSellerApproved) {
            log.warn("Trade Blocked: Seller {} KYC is not APPROVED", sellerId);
        }

        return isBuyerApproved && isSellerApproved;
    }

    @Transactional
    public void saveUserProfile(UserProfileDto dto) {
        UserProfile profile = userProfileRepository.findByEmail(dto.getEmail())
                .orElse(new UserProfile());
        
        profile.setLegalName(dto.getLegalName());
        profile.setMobileNumber(dto.getMobileNumber());
        profile.setEmail(dto.getEmail());
        profile.setVerifiedCurrentAddress(dto.getVerifiedCurrentAddress());
        profile.setLatitude(dto.getLatitude());
        profile.setLongitude(dto.getLongitude());
        profile.setAadhaarNumber(dto.getAadhaarNumber());
        profile.setPanNumber(dto.getPanNumber());
        profile.setKycStatus(KycStatus.PENDING); // Reset to pending upon new submission

        if (profile.getHouseholdEvaluation() == null) {
            profile.setHouseholdEvaluation(new HouseholdEvaluation());
        }
        HouseholdEvaluation evaluation = profile.getHouseholdEvaluation();
        evaluation.setHomeType(dto.getHomeType());
        evaluation.setOwnershipStatus(dto.getOwnershipStatus());
        evaluation.setLandlordRwaPetAllowanceFlag(dto.isLandlordRwaPetAllowanceFlag());
        evaluation.setRwaNocDocumentPath(dto.getRwaNocDocumentPath());
        evaluation.setReasonToAdoptOrBuy(dto.getReasonToAdoptOrBuy());

        userProfileRepository.save(profile);
    }
}
