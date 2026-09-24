package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ProductCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "product-custom")
public interface ProductCustomRepository extends JpaRepository<ProductCustom,Long> {
}
