package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ProductMil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(path = "product-mil")
public interface ProductMilRepository extends JpaRepository<ProductMil, Long> {
    List<ProductMil> findByProductId(Long productId);

    Optional<ProductMil> findByProductIdAndId(Long productId, Long id);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(pm.stockQuantity), 0L) FROM ProductMil pm WHERE pm.product.id = :productId")
    Long sumStockByProductId(@org.springframework.data.repository.query.Param("productId") Long productId);
    @org.springframework.data.rest.core.annotation.RestResource(exported = false)
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select v from ProductMil v where v.id = :id")
    java.util.Optional<ProductMil> lockById(Long id);
}
