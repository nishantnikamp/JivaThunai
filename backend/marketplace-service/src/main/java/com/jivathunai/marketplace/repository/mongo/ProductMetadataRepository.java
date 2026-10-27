package com.jivathunai.marketplace.repository.mongo;
import com.jivathunai.marketplace.document.ProductMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface ProductMetadataRepository extends MongoRepository<ProductMetadata, String> {}
