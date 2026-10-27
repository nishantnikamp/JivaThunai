package com.jivathunai.adoption.document;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentFile {
    private String docId;
    private String type;
    private String secureFileUrl;
    private String verificationStatus;
}
