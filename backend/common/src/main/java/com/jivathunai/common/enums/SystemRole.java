package com.jivathunai.common.enums;

/**
 * Enterprise Multi-Role RBAC System for Jiva Thunai Platform
 * Defines 22 fine-grained system roles mapping across the entire pet ecosystem.
 */
public enum SystemRole {
    SUPER_ADMIN("Super Administrator", "Full system access & platform governance"),
    ADMIN("Administrator", "Platform management, verification & user role approvals"),
    PET_OWNER("Pet Owner", "Manage registered pets, medical records, digital passport & reminders"),
    BUYER("Pet / Product Buyer", "Browse & buy pets, products, submit adoption applications"),
    SELLER("Verified Pet Breeder / Seller", "List pets for sale under PCA 1960 & Dog Breeding Rules"),
    PRODUCT_SHOP_OWNER("Product Shop Owner", "Manage pet food, accessories & medical inventory"),
    PRODUCT_STAFF("Product Staff", "Order fulfillment & inventory management"),
    VETERINARY_ADMIN("Veterinary Admin", "Hospital admin, manage docs, staff, & monitor organization"),
    VETERINARY_DOCTOR("Veterinary Doctor", "Manage appointments, issue prescriptions, sign medical logs"),
    ASSISTANT_VET_DOCTOR("Assistant Veterinary Doctor", "Assist Veterinary Doctors, assigned to one doctor"),
    VET_STAFF("Veterinary Staff", "Clinic schedule, patient check-in & record uploads"),
    GROOMING_OWNER("Grooming Salon Owner", "Manage grooming services, staff & booking packages"),
    GROOMING_STAFF("Grooming Staff", "Execute grooming appointments & upload before/after photos"),
    TRAINER_OWNER("Pet Training Academy Owner", "Manage training programs, classes & online consultation"),
    TRAINER_STAFF("Pet Trainer Staff", "Conduct pet training sessions & issue certificates"),
    CARETAKER("Boarding Caretaker / Sitter", "Manage pet sitting, daycare & boarding facilities"),
    DELIVERY_PARTNER("Pet & Supplies Delivery Partner", "Handle pet transportation & supply delivery"),
    NGO_SHELTER("NGO / Animal Shelter", "List rescue pets, review PCA adoption applications, verify homes"),
    MODERATOR("Content Moderator", "Review community posts, listings & flag illegal pet trade"),
    CUSTOMER_SUPPORT("Customer Support Executive", "Handle support tickets, user disputes & helpline"),
    FINANCE("Finance Executive", "Platform payments, wallet transactions & seller payouts"),
    MARKETING("Marketing Executive", "Promotions, contests, pet meetups & campaigns"),
    AUDITOR("Regulatory Compliance Auditor", "Audit KYC, municipal licenses & PCA Act compliance logs"),
    ANIMAL_WELFARE_OFFICER("Animal Welfare Officer", "AWBI legal oversight, inspection & shelter verification");

    private final String displayName;
    private final String description;

    SystemRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
