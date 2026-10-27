package com.jivathunai.marketplace.document;

import com.jivathunai.marketplace.enums.DocumentType;
import com.jivathunai.marketplace.enums.VerificationStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentFile {
    private String docId;
    private DocumentType type;
    private String secureFileUrl;
    private VerificationStatus verificationStatus;
}
