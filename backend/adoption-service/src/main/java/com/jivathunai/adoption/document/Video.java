package com.jivathunai.adoption.document;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    private String videoUrl;
    private String contentType;
    private Integer durationSeconds;
}
