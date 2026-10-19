package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ProductMil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "product-mil")
public interface ProductMilRepository extends JpaRepository<ProductMil, Long> {
    @org.springframework.data.rest.core.annotation.RestResource(exported = false)
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select v from ProductMil v where v.id = :id")
    java.util.Optional<ProductMil> lockById(Long id);
}
