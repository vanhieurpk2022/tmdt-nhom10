package com.nhom10.tmdt.repo;


import com.nhom10.tmdt.model.ProductCustomItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "product-custom-item")
public interface ProductCustomItemRepository extends JpaRepository<ProductCustomItem,Long> {
}
