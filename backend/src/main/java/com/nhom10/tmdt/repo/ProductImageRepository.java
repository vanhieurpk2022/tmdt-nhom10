package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "product-image")
public interface ProductImageRepository extends JpaRepository<ProductImage,Long> {
}
