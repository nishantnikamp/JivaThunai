package com.jivathunai.marketplace.dto;

import com.jivathunai.marketplace.document.PetSaleMetadata;
import com.jivathunai.marketplace.entity.PetSaleListing;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetSaleDTO {
    private PetSaleListing listing;
    private PetSaleMetadata metadata;
}
