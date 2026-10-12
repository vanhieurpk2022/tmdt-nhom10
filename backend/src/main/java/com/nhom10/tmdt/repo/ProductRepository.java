package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "product")
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Đếm số sản phẩm theo từng category để hiển thị (18), (12)... trong bộ lọc
    @Query("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.category IS NOT NULL GROUP BY p.category.id")
    List<Object[]> countByCategory();

    // Đếm số sản phẩm theo từng factory
    @Query("SELECT p.factory.id, COUNT(p) FROM Product p WHERE p.factory IS NOT NULL GROUP BY p.factory.id")
    List<Object[]> countByFactory();
}
