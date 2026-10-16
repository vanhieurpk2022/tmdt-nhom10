package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "product")
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Đếm số sản phẩm theo từng category để hiển thị (18), (12)... trong bộ lọc (chỉ tính sản phẩm bán lẻ thông thường)
    @Query("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.category IS NOT NULL AND (p.productType = 'NORMAL' OR p.productType IS NULL) GROUP BY p.category.id")
    List<Object[]> countByCategory();

    // Đếm số sản phẩm theo từng factory (chỉ tính sản phẩm bán lẻ thông thường)
    @Query("SELECT p.factory.id, COUNT(p) FROM Product p WHERE p.factory IS NOT NULL AND (p.productType = 'NORMAL' OR p.productType IS NULL) GROUP BY p.factory.id")
    List<Object[]> countByFactory();

    @Query("SELECT p FROM Product p WHERE (p.productType = 'NORMAL' OR p.productType IS NULL) ORDER BY p.createdAt DESC, p.id DESC")
    List<Product> findNewestProducts(Pageable pageable);

    List<Product> findByFactoryId(Long factoryId);
}
