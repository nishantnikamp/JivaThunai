package com.jivathunai.identity.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jivathunai.identity.entity.CmsSetting;
import com.jivathunai.identity.entity.NewsArticle;
import com.jivathunai.identity.repository.CmsSettingRepository;
import com.jivathunai.identity.repository.NewsArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CmsService {

    private final CmsSettingRepository cmsSettingRepository;
    private final NewsArticleRepository newsArticleRepository;
    private final ObjectMapper objectMapper;

    // Keys
    public static final String KEY_FOOTER = "FOOTER_MANAGEMENT";
    public static final String KEY_LEGAL_TERMS = "LEGAL_TERMS";
    public static final String KEY_LEGAL_PRIVACY = "LEGAL_PRIVACY";
    public static final String KEY_LEGAL_COOKIE = "LEGAL_COOKIE";
    public static final String KEY_LEGAL_REFUND = "LEGAL_REFUND";
    public static final String KEY_COMPANY_INFO = "COMPANY_INFO";
    public static final String KEY_WEBSITE_INFO = "WEBSITE_INFO";
    public static final String KEY_SOCIAL_MEDIA = "SOCIAL_MEDIA";
    public static final String KEY_CONTACT_SUPPORT = "CONTACT_SUPPORT";
    public static final String KEY_SEO_METADATA = "SEO_METADATA";

    @PostConstruct
    public void initDefaults() {
        try {
            seedDefaultIfMissing(KEY_COMPANY_INFO, "COMPANY", getDefaultCompanyInfo());
            seedDefaultIfMissing(KEY_WEBSITE_INFO, "WEBSITE", getDefaultWebsiteInfo());
            seedDefaultIfMissing(KEY_FOOTER, "FOOTER", getDefaultFooterInfo());
            seedDefaultIfMissing(KEY_SOCIAL_MEDIA, "SOCIAL", getDefaultSocialMedia());
            seedDefaultIfMissing(KEY_CONTACT_SUPPORT, "CONTACT", getDefaultContactSupport());
            seedDefaultIfMissing(KEY_SEO_METADATA, "SEO", getDefaultSeoMetadata());
            seedDefaultIfMissing(KEY_LEGAL_TERMS, "LEGAL", getDefaultTermsAndConditions());
            seedDefaultIfMissing(KEY_LEGAL_PRIVACY, "LEGAL", getDefaultPrivacyPolicy());
            seedDefaultIfMissing(KEY_LEGAL_COOKIE, "LEGAL", getDefaultCookiePolicy());
            seedDefaultIfMissing(KEY_LEGAL_REFUND, "LEGAL", getDefaultRefundPolicy());
        } catch (Exception e) {
            log.warn("Could not initialize default CMS settings: {}", e.getMessage());
        }
    }

    private void seedDefaultIfMissing(String key, String category, Object defaultObject) {
        if (!cmsSettingRepository.existsById(key)) {
            try {
                String json = defaultObject instanceof String ? (String) defaultObject : objectMapper.writeValueAsString(defaultObject);
                cmsSettingRepository.save(CmsSetting.builder()
                        .settingKey(key)
                        .category(category)
                        .settingValue(json)
                        .build());
            } catch (Exception e) {
                log.error("Failed to seed setting {}: {}", key, e.getMessage());
            }
        }
    }

    public Map<String, Object> getAllSettings() {
        Map<String, Object> result = new LinkedHashMap<>();
        List<CmsSetting> all = cmsSettingRepository.findAll();
        for (CmsSetting s : all) {
            try {
                // If it's JSON object/array, parse it; otherwise return raw string
                String val = s.getSettingValue();
                if (val != null && (val.startsWith("{") || val.startsWith("["))) {
                    result.put(s.getSettingKey(), objectMapper.readValue(val, Object.class));
                } else {
                    result.put(s.getSettingKey(), val);
                }
            } catch (Exception e) {
                result.put(s.getSettingKey(), s.getSettingValue());
            }
        }
        return result;
    }

    public Object getSetting(String key) {
        return cmsSettingRepository.findById(key)
                .map(s -> {
                    String val = s.getSettingValue();
                    try {
                        if (val != null && (val.startsWith("{") || val.startsWith("["))) {
                            return objectMapper.readValue(val, Object.class);
                        }
                    } catch (Exception ignored) {}
                    return (Object) val;
                })
                .orElse(null);
    }

    @Transactional
    public void updateSetting(String key, Object value, String category) {
        try {
            String jsonVal = value instanceof String ? (String) value : objectMapper.writeValueAsString(value);
            CmsSetting setting = cmsSettingRepository.findById(key)
                    .orElseGet(() -> CmsSetting.builder().settingKey(key).category(category).build());
            setting.setSettingValue(jsonVal);
            if (category != null) {
                setting.setCategory(category);
            }
            cmsSettingRepository.save(setting);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update CMS setting " + key + ": " + e.getMessage(), e);
        }
    }

    // News & Community Methods
    public Page<NewsArticle> getPublishedArticles(String category, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);
        if (category != null && !category.equalsIgnoreCase("ALL") && !category.trim().isEmpty()) {
            return newsArticleRepository.findByCategoryAndPublishedTrueOrderByPublishedAtDesc(category, pageable);
        }
        return newsArticleRepository.findByPublishedTrueOrderByPublishedAtDesc(pageable);
    }

    public Page<NewsArticle> getAllArticlesForAdmin(String category, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);
        if (category != null && !category.equalsIgnoreCase("ALL") && !category.trim().isEmpty()) {
            return newsArticleRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        }
        return newsArticleRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public NewsArticle getArticleBySlugOrId(String slugOrId, boolean incrementView) {
        NewsArticle article = null;
        try {
            Long id = Long.parseLong(slugOrId);
            article = newsArticleRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (article == null) {
            article = newsArticleRepository.findBySlug(slugOrId)
                    .orElseThrow(() -> new NoSuchElementException("Article not found: " + slugOrId));
        }

        if (incrementView) {
            article.setViewsCount(article.getViewsCount() + 1);
            newsArticleRepository.save(article);
        }
        return article;
    }

    @Transactional
    public NewsArticle createArticle(NewsArticle article) {
        if (article.getSlug() == null || article.getSlug().trim().isEmpty()) {
            String generatedSlug = article.getTitle().toLowerCase()
                    .replaceAll("[^a-z0-9\\s]", "")
                    .replaceAll("\\s+", "-") + "-" + System.currentTimeMillis() % 10000;
            article.setSlug(generatedSlug);
        }
        return newsArticleRepository.save(article);
    }

    @Transactional
    public NewsArticle updateArticle(Long id, NewsArticle updates) {
        NewsArticle existing = newsArticleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Article not found with ID: " + id));

        existing.setTitle(updates.getTitle());
        if (updates.getSlug() != null && !updates.getSlug().trim().isEmpty()) {
            existing.setSlug(updates.getSlug());
        }
        existing.setCategory(updates.getCategory());
        existing.setSummary(updates.getSummary());
        existing.setContent(updates.getContent());
        existing.setPhotoUrl(updates.getPhotoUrl());
        existing.setVideoUrl(updates.getVideoUrl());
        existing.setPdfUrl(updates.getPdfUrl());
        existing.setPdfFileName(updates.getPdfFileName());
        existing.setAuthorName(updates.getAuthorName());
        existing.setPublished(updates.isPublished());
        return newsArticleRepository.save(existing);
    }

    @Transactional
    public void deleteArticle(Long id) {
        newsArticleRepository.deleteById(id);
    }

    // Default Seed Payloads
    private Map<String, Object> getDefaultCompanyInfo() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("companyName", "Jiva Thunai Animal Welfare Technologies Private Limited");
        map.put("brandName", "Jiva Thunai");
        map.put("cin", "U85200TN2026PTC198421");
        map.put("gstin", "33AAACJ9842A1ZP");
        map.put("pan", "AAACJ9842A");
        map.put("registeredAddress", "Tower 4, Guindy Industrial Estate, Chennai, Tamil Nadu 600032, India");
        map.put("corporateEmail", "official@jivathunai.org");
        map.put("corporatePhone", "+91 44 2841 9000");
        map.put("operatingHours", "Monday – Saturday: 09:00 AM – 07:00 PM IST (Emergency Services: 24/7)");
        return map;
    }

    private Map<String, Object> getDefaultWebsiteInfo() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("websiteName", "Jiva Thunai");
        map.put("tagline", "The Complete Connected Pet Care Ecosystem");
        map.put("domain", "jivathunai.org");
        map.put("logoUrl", "/jivathunailogo.png");
        map.put("faviconUrl", "/favicon.ico");
        map.put("primaryColor", "#059669");
        map.put("emergencyHotline", "1800-VET-911");
        return map;
    }

    private Map<String, Object> getDefaultFooterInfo() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("copyrightText", "© 2026 Jiva Thunai Animal Welfare Platform. All Rights Reserved.");
        map.put("legalDisclaimer", "Prevention of Cruelty to Animals (PCA) Act 1960 & AWBI Pet Shop / Dog Breeding Rules 2018 Statutory Standard.");
        map.put("bottomTagline", "One platform. Every pet. Every stage of care.");
        
        List<Map<String, Object>> columns = new ArrayList<>();
        
        Map<String, Object> col1 = new LinkedHashMap<>();
        col1.put("title", "Platform Modules");
        col1.put("links", List.of(
                Map.of("label", "Find Vet Hospitals", "url", "/hospitals"),
                Map.of("label", "Pet Marketplace", "url", "/marketplace"),
                Map.of("label", "PCA 1960 Adoptions", "url", "/adoptions"),
                Map.of("label", "Care Continuity & Reminders", "url", "/care-continuity"),
                Map.of("label", "Digital QR Pet Passport", "url", "/Profile")
        ));
        columns.add(col1);

        Map<String, Object> col2 = new LinkedHashMap<>();
        col2.put("title", "Clinical & Emergency");
        col2.put("links", List.of(
                Map.of("label", "24/7 Trauma Emergency Locator", "url", "/emergency-cases"),
                Map.of("label", "Hospital Operations Cockpit", "url", "/hospital-operations"),
                Map.of("label", "Book Vet Appointments", "url", "/vet-appointments"),
                Map.of("label", "Medical Health Records", "url", "/medical"),
                Map.of("label", "Register Vet Hospital", "url", "/vet/signup/hospital")
        ));
        columns.add(col2);

        Map<String, Object> col3 = new LinkedHashMap<>();
        col3.put("title", "Legal & Community");
        col3.put("links", List.of(
                Map.of("label", "Terms & Conditions", "url", "/terms"),
                Map.of("label", "Privacy Policy", "url", "/privacy"),
                Map.of("label", "Cookie Policy", "url", "/cookie-policy"),
                Map.of("label", "Refund & Cancellation Policy", "url", "/refund-policy"),
                Map.of("label", "News & Community", "url", "/news")
        ));
        columns.add(col3);

        Map<String, Object> col4 = new LinkedHashMap<>();
        col4.put("title", "Support & Inquiries");
        col4.put("links", List.of(
                Map.of("label", "Help & Verification Center", "url", "/hospitals"),
                Map.of("label", "Provider Onboarding", "url", "/vet/signup"),
                Map.of("label", "Breeder AWBI Guidelines", "url", "/terms"),
                Map.of("label", "Report Animal Cruelty", "url", "/emergency-cases")
        ));
        columns.add(col4);

        map.put("columns", columns);
        return map;
    }

    private Map<String, Object> getDefaultSocialMedia() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("facebook", "https://facebook.com/jivathunai");
        map.put("instagram", "https://instagram.com/jivathunai");
        map.put("youtube", "https://youtube.com/@jivathunai");
        map.put("linkedin", "https://linkedin.com/company/jivathunai");
        map.put("twitter", "https://twitter.com/jivathunai");
        map.put("whatsappSupport", "+919999988888");
        return map;
    }

    private Map<String, Object> getDefaultContactSupport() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("supportEmail", "support@jivathunai.org");
        map.put("legalEmail", "compliance@jivathunai.org");
        map.put("emergencyPhone", "+91 99999 88888");
        map.put("tollFreePhone", "1800-VET-CARE (1800-838-2273)");
        map.put("helpCenterUrl", "/help");
        map.put("businessInquiries", "partnerships@jivathunai.org");
        return map;
    }

    private Map<String, Object> getDefaultSeoMetadata() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("defaultTitle", "Jiva Thunai — The Complete Connected Pet Care Ecosystem");
        map.put("metaDescription", "Discover veterinary hospitals, book certified doctors, manage pet health passports, care plans, and emergency trauma under PCA Act 1960 standards.");
        map.put("keywords", "veterinary hospital, pet care, dog adoption, pet passport, pet health records, PCA Act 1960, emergency vet, vet surgery, cat clinic, AWBI breeder");
        map.put("ogImage", "/jivathunailogo.png");
        return map;
    }

    private Map<String, Object> getDefaultTermsAndConditions() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("version", "v2.4");
        map.put("effectiveDate", "October 2026");
        map.put("title", "Terms and Conditions of Service");
        map.put("content", "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;\">1. Acceptance of Terms & Regulatory Framework</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Welcome to <strong>Jiva Thunai</strong>. By accessing or using our platform, mobile applications, digital pet passports, and clinical scheduling services, you agree to be legally bound by these Terms and Conditions and our Privacy Policy. All companion animal transactions, healthcare records, shelter adoptions, and care delegations operating within Jiva Thunai are strictly governed by the <strong>Prevention of Cruelty to Animals (PCA) Act, 1960</strong>, the <strong>Animal Birth Control Rules</strong>, and the <strong>Pet Shop Rules 2018</strong> mandated by the Animal Welfare Board of India (AWBI).</p>" +
                "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;margin-top:24px;\">2. Companion Animal Custody & Statutory Anti-Neglect Obligation</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Under <mark style=\"background-color:#fef08a;padding:2px 6px;border-radius:4px;\">Section 11 of the PCA Act 1960</mark>, any person having custody, charge, or possession of an animal is under a strict legal duty to provide adequate food, clean drinking water, sheltered accommodation, and necessary medical treatment. The <em>Jiva Thunai Missed Care Protection</em> system functions as an evidentiary record of compliance. Deliberate treatment abandonment or neglect will result in immediate profile suspension and reporting to municipal animal welfare enforcement authorities.</p>" +
                "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;margin-top:24px;\">3. Veterinary Institutional Showcase & Doctor Verification</h2>" +
                "<ul style=\"font-size:14px;color:#334155;line-height:1.8;padding-left:20px;\">" +
                "<li>All registered veterinary doctors must hold a recognized degree registrable under the <strong>Indian Veterinary Council Act (VCI)</strong>.</li>" +
                "<li>Veterinary hospitals and clinics warrant that physical branches maintain valid <strong>Clinical Establishment Act registrations</strong> and Bio-Medical Waste authorizations.</li>" +
                "<li>Hospital profile modifications, ICU bed updates, and operation theatre rosters are restricted to authorized administrators.</li>" +
                "</ul>" +
                "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;margin-top:24px;\">4. Smart Care Plans & Temporary Custody Delegation</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Pet parents delegating temporary custody to boarding facilities, pet sitters, or family members grant time-bounded digital authorizations. Caretakers must record task completion (feeding, medication doses, recovery checks) faithfully. Care delegations automatically terminate upon expiration and can be revoked by the pet parent at any time.</p>");
        return map;
    }

    private Map<String, Object> getDefaultPrivacyPolicy() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("version", "v2.1");
        map.put("effectiveDate", "October 2026");
        map.put("title", "Privacy Policy & Health Data Protection");
        map.put("content", "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;\">1. Information We Collect</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Jiva Thunai collects personal contact information (name, verified mobile number, email, address) and companion animal biological records (pet photos, species, breed, age, weight, microchip identification, vaccination records, diagnosis histories, and prescriptions).</p>" +
                "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;margin-top:24px;\">2. Consent-Based Medical Record Disclosure</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\"><mark style=\"background-color:#bbf7d0;padding:2px 6px;border-radius:4px;\">Zero-Trust Medical Privacy</mark>: Your pet's clinical history, diagnostic scans, and surgical records are never shared with third-party advertisers or unrestricted providers. Records are shared strictly with the treating veterinary hospital upon your appointment booking or during emergency intake.</p>" +
                "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;margin-top:24px;\">3. Cryptographic QR Identity Tags</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Public scans of your pet's QR tag display verified ownership credentials, rabies vaccination certificates, and emergency contact hotlines to ensure lost pets can be safely reunited while shielding your private residential documents.</p>");
        return map;
    }

    private Map<String, Object> getDefaultCookiePolicy() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("version", "v1.5");
        map.put("effectiveDate", "October 2026");
        map.put("title", "Cookie & Local Storage Policy");
        map.put("content", "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;\">Essential Session & Security Storage</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">We utilize essential cookies and encrypted local storage strictly for maintaining your authenticated session, cryptographic JSON Web Tokens (JWT), role-switching states, and active shopping cart contents. We do not employ intrusive tracking cookies across external websites.</p>");
        return map;
    }

    private Map<String, Object> getDefaultRefundPolicy() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("version", "v2.0");
        map.put("effectiveDate", "October 2026");
        map.put("title", "Refund, Cancellation & Appointment Policy");
        map.put("content", "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;\">1. Veterinary Consultation Cancellations</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Appointments canceled at least 2 hours prior to the scheduled slot are eligible for a 100% refund or free rescheduling. Late cancellations for emergency trauma or booked operating theatre slots may incur a clinical reservation fee as determined by the hospital's policy.</p>" +
                "<h2 style=\"font-size:22px;color:#0f172a;font-weight:900;margin-top:24px;\">2. Regulated Marketplace Orders</h2>" +
                "<p style=\"font-size:14px;color:#334155;line-height:1.7;\">Damaged or incorrect pet food, supplements, or accessories are eligible for free replacement or refund within 48 hours of doorstep delivery. Veterinary prescription medicines cannot be returned once unsealed.</p>");
        return map;
    }
}
