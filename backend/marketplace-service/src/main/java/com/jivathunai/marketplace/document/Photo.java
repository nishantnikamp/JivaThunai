package com.jivathunai.marketplace.document;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    private String s3Url;
    private String thumbnailUrl;
    private boolean isPrimary;
    private LocalDateTime uploadedAt;
}
