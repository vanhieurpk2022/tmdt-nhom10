package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.dto.factory.FactoryProductItem;
import com.nhom10.tmdt.dto.factory.FactoryProductResponse;
import com.nhom10.tmdt.dto.factory.FactoryProductStats;
import com.nhom10.tmdt.dto.product.CategoryDto;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "product")
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Đếm số sản phẩm theo từng category để hiển thị (18), (12)... trong bộ lọc (chỉ tính sản phẩm bán lẻ thông thường)
    @Query("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.category IS NOT NULL AND (p.productType = 'NORMAL' OR p.productType IS NULL) GROUP BY p.category.id")
    List<Object[]> countByCategory();

    @Query("""
        SELECT new com.nhom10.tmdt.dto.product.CategoryDto(c.id, c.name, COUNT(p))
        FROM Product p JOIN p.category c
        WHERE p.factory.id = :factoryId
          AND (p.productType = 'NORMAL' OR p.productType IS NULL)
        GROUP BY c.id, c.name
        ORDER BY c.name
        """)
    List<CategoryDto> findCategoriesByFactoryId(@Param("factoryId") Long factoryId);

    // Đếm số sản phẩm theo từng factory (chỉ tính sản phẩm bán lẻ thông thường)
    @Query("SELECT p.factory.id, COUNT(p) FROM Product p WHERE p.factory IS NOT NULL AND (p.productType = 'NORMAL' OR p.productType IS NULL) GROUP BY p.factory.id")
    List<Object[]> countByFactory();

    @Query("SELECT p FROM Product p WHERE (p.productType = 'NORMAL' OR p.productType IS NULL) ORDER BY p.createdAt DESC, p.id DESC")
    List<Product> findNewestProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE (p.productType = 'NORMAL' OR p.productType IS NULL) ORDER BY COALESCE(p.views, 0L) DESC, p.id DESC")
    List<Product> findMostViewedProducts(Pageable pageable);

    List<Product> findByFactoryId(Long factoryId);

    @Query("""
SELECT new com.nhom10.tmdt.dto.factory.FactoryProductStats(
    (SELECT COUNT(p) FROM Product p WHERE p.factory.id = :factoryId),
    (SELECT COUNT(p) FROM Product p
     WHERE p.factory.id = :factoryId
       AND EXISTS (SELECT 1 FROM ProductMil m
                   WHERE m.product = p
                     AND m.isActive =true )),
    (SELECT COUNT(p) FROM Product p
     WHERE p.factory.id = :factoryId
       AND NOT EXISTS (SELECT 1 FROM ProductMil m
                       WHERE m.product = p AND m.stockQuantity > 0)),
    COALESCE((SELECT SUM(item.quantity) FROM OrderItem item
              WHERE item.product.factory.id = :factoryId), 0L)
)
FROM Factory f
WHERE f.id = :factoryId
""")
    FactoryProductStats getStats(@Param("factoryId") Long factoryId);

    // báo lỗi nhưng vẫn chạy c
    @SuppressWarnings("JpaQlInspection")
    @Query("""
        SELECT new com.nhom10.tmdt.dto.factory.FactoryProductItem(
            p.id,
            p.name,
           COALESCE((SELECT SUM(pm.stockQuantity) FROM ProductMil pm WHERE pm.product = p), 0L),
           COALESCE((SELECT SUM(item.quantity) FROM OrderItem item WHERE item.product = p), 0L),
            p.status,
            p.productType,
            p.createdAt,
            c.name,
            (SELECT MIN(image.imageUrl) FROM ProductImage image WHERE image.product = p AND image.isThumbnail = true)
        )
        FROM Product p
        LEFT JOIN p.category c
        WHERE p.factory.id = :factoryId
        ORDER BY p.createdAt DESC
        """)
    List<FactoryProductItem> getProducts(@Param("factoryId") Long factoryId);

    long countByStatus(ProductStatus status);

    long countByProductType(ProductType productType);

    @Query("SELECT COUNT(DISTINCT p.factory.id) FROM Product p WHERE p.factory IS NOT NULL")
    long countDistinctFactories();
}
