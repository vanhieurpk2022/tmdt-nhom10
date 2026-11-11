package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.model.Product;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dịch vụ gợi ý "Mua kèm thường xuyên" (Frequently Bought Together).
 *
 * Thuật toán Association Rule Mining (FP-Growth đơn giản hóa):
 *   1. Tìm tất cả đơn hàng có chứa sản phẩm mục tiêu (transaction mining).
 *   2. Từ các transaction đó, đếm tần suất đồng xuất hiện của sản phẩm khác
 *      → đây là bước tính Support của itemset {targetProduct, candidateProduct}.
 *   3. Tính Confidence = Support({A,B}) / Support({A})
 *      = (số đơn chứa cả A và B) / (số đơn chứa A).
 *   4. Trả về Top-K sản phẩm có Confidence cao nhất (loại trừ targetProduct,
 *      sản phẩm ngừng bán, và sản phẩm hết tất cả variant).
 *
 * Fallback: Nếu không đủ dữ liệu (sản phẩm mới, ít đơn hàng) → trả danh sách rỗng
 * để caller tự quyết định fallback tiếp theo (bán chạy, mới nhất…).
 */
@Service
@Transactional(readOnly = true)
public class FrequentlyBoughtTogetherService {

    @PersistenceContext
    private EntityManager em;

    /**
     * Tìm Top-K sản phẩm thường được mua kèm với sản phẩm chỉ định.
     *
     * @param productId ID sản phẩm mục tiêu (A)
     * @param limit     Số lượng sản phẩm cần trả về (thường 4)
     * @return Danh sách sản phẩm gợi ý sắp xếp theo Confidence giảm dần
     */
    @SuppressWarnings("unchecked")
    public List<Product> findBoughtTogether(Long productId, int limit) {
        if (productId == null || limit <= 0) return Collections.emptyList();

        // 1. Lấy danh sách order_id chứa sản phẩm mục tiêu (Support của A)
        List<Long> orderIds = em.createQuery(
                        "SELECT DISTINCT oi.order.id FROM OrderItem oi WHERE oi.product.id = :pid",
                        Long.class)
                .setParameter("pid", productId)
                .getResultList();

        if (orderIds.isEmpty()) return Collections.emptyList();

        long supportA = orderIds.size(); // Support({A})

        // 2. Đếm Support({A, B}) — số đơn hàng mà sản phẩm B xuất hiện cùng A
        //    Tính Confidence = Support({A,B}) / Support({A}) và sắp xếp giảm dần
        List<Object[]> rows = em.createQuery(
                        "SELECT oi.product, COUNT(DISTINCT oi.order.id) AS supportAB " +
                        "FROM OrderItem oi " +
                        "WHERE oi.order.id IN :orderIds " +
                        "  AND oi.product.id <> :pid " +
                        "  AND oi.product.status = :active " +
                        "GROUP BY oi.product " +
                        "ORDER BY supportAB DESC",
                        Object[].class)
                .setParameter("orderIds", orderIds)
                .setParameter("pid", productId)
                .setParameter("active", ProductStatus.ACTIVE)
                .setMaxResults(limit * 4) // lấy dư để lọc hết hàng bên dưới
                .getResultList();

        if (rows.isEmpty()) return Collections.emptyList();

        // 3. Lọc: giữ sản phẩm có ít nhất 1 variant còn hàng, lấy Top-K
        return rows.stream()
                .map(row -> (Product) row[0])
                .filter(p -> hasAvailableVariant(p))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra sản phẩm có ít nhất một variant (ProductMil) đang active và còn hàng.
     * Nếu chưa load productMils (lazy) → coi là còn hàng để tránh N+1 query ở đây
     * (ProductService sẽ chuyển đổi sang DTO và tự xử lý stockStatus).
     */
    private boolean hasAvailableVariant(Product p) {
        if (p.getProductMils() == null || p.getProductMils().isEmpty()) return true;
        return p.getProductMils().stream()
                .anyMatch(m -> m.isActive() && m.getStockQuantity() > 0);
    }
}

