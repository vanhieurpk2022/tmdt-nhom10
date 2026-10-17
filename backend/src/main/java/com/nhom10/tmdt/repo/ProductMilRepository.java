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
}
