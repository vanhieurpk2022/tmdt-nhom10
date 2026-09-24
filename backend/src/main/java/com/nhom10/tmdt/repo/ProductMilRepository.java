package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ProductMil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "product-mil")
public interface ProductMilRepository extends JpaRepository<ProductMil, Long> {
}
