package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

@RepositoryRestResource(path = "product-image")
public interface ProductImageRepository extends JpaRepository<ProductImage,Long> {
    @RestResource(path = "byProductId", rel = "byProductId")
    List<ProductImage> findByProductId(Long productId);

    List<ProductImage> findByIsThumbnail(boolean isThumbnail);
}
