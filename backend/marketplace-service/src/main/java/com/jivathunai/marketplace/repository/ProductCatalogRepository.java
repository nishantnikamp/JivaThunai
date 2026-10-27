package com.jivathunai.marketplace.repository;
import com.jivathunai.marketplace.entity.ProductCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.List;

public interface ProductCatalogRepository extends JpaRepository<ProductCatalog, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductCatalog p WHERE p.sku = :sku")
    Optional<ProductCatalog> findByIdWithPessimisticLock(@Param("sku") String sku);

    @Query("SELECT p FROM ProductCatalog p WHERE " +
           "(p.categoryId = :category OR :category = '') AND " +
           "(p.retailPrice >= :minPrice) AND " +
           "(p.retailPrice <= :maxPrice) AND " +
           "(p.targetSpecies = :species OR :species = '')")
    List<ProductCatalog> findWithFilters(@Param("category") String category,
                                         @Param("minPrice") BigDecimal minPrice,
                                         @Param("maxPrice") BigDecimal maxPrice,
                                         @Param("species") String species);

    @Query("SELECT DISTINCT p.categoryId FROM ProductCatalog p WHERE p.categoryId IS NOT NULL AND p.categoryId <> '' ORDER BY p.categoryId ASC")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT p.targetSpecies FROM ProductCatalog p WHERE p.targetSpecies IS NOT NULL AND p.targetSpecies <> '' ORDER BY p.targetSpecies ASC")
    List<String> findDistinctTargetSpecies();

    @Query("SELECT DISTINCT p.brand FROM ProductCatalog p WHERE p.brand IS NOT NULL AND p.brand <> '' ORDER BY p.brand ASC")
    List<String> findDistinctBrands();
}
