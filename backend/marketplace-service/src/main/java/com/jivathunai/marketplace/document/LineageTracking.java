package com.jivathunai.marketplace.document;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineageTracking {
    private String sireDetails;
    private String damDetails;
    private String breederNotes;
}
