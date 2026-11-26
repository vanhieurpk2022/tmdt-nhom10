package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.repo.ProductRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Apriori giới hạn ở tập hai sản phẩm {A, B}, phù hợp với gợi ý mua kèm từng sản phẩm.
 * Đơn hợp lệ -> L1 -> C2 -> L2 -> confidence/lift -> sản phẩm còn mở bán.
 */
@Service
@Transactional(readOnly = true)
public class FrequentlyBoughtTogetherService {
    private static final int MIN_PAIR_ORDERS = 3;
    private static final double MIN_SUPPORT = 0.02;
    private static final double MIN_CONFIDENCE = 0.20;
    private static final double MIN_LIFT = 1.0;

    private final EntityManager entityManager;
    private final ProductRepository productRepo;

    public FrequentlyBoughtTogetherService(EntityManager entityManager, ProductRepository productRepo) {
        this.entityManager = entityManager;
        this.productRepo = productRepo;
    }

    public List<Product> findBoughtTogether(Long productId, int limit) {
        if (productId == null || limit <= 0) return List.of();

        List<AssociationRule> rules = mineRules(productId, loadTransactions());
        if (rules.isEmpty()) return List.of();

        // Chỉ giới hạn số lượng sau khi đã bỏ sản phẩm ẩn, riêng tư hoặc hết hàng.
        Map<Long, Product> availableProducts = productRepo.findAll().stream()
                .filter(RecommendationEligibility::isAvailable)
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        return rules.stream()
                .map(rule -> availableProducts.get(rule.productId()))
                .filter(Objects::nonNull)
                .limit(limit)
                .toList();
    }

    private List<Set<Long>> loadTransactions() {
        // 1. Một giao dịch là một đơn đã giao và đã thanh toán.
        // Set loại trùng khi cùng sản phẩm có nhiều dung tích hoặc nhiều dòng trong đơn.
        List<Object[]> rows = entityManager.createQuery("""
                SELECT DISTINCT item.order.id, item.product.id
                FROM OrderItem item
                WHERE item.order.status = :delivered
                  AND item.order.paymentStatus = :paid
                  AND (item.product.productType = :normal OR item.product.productType IS NULL)
                ORDER BY item.order.id, item.product.id
                """, Object[].class)
                .setParameter("delivered", OrderStatus.DELIVERED)
                .setParameter("paid", PaymentStatus.PAID)
                .setParameter("normal", ProductType.NORMAL)
                .getResultList();

        Map<Long, Set<Long>> baskets = new LinkedHashMap<>();
        for (Object[] row : rows) {
            baskets.computeIfAbsent((Long) row[0], ignored -> new HashSet<>()).add((Long) row[1]);
        }
        return new ArrayList<>(baskets.values());
    }

    List<AssociationRule> mineRules(Long targetId, List<Set<Long>> transactions) {
        if (targetId == null || transactions == null || transactions.isEmpty()) return List.of();
        int transactionCount = transactions.size();
        int minCount = Math.max(MIN_PAIR_ORDERS, (int) Math.ceil(transactionCount * MIN_SUPPORT));

        // 2. L1: các sản phẩm xuất hiện đủ số đơn tối thiểu.
        Map<Long, Long> itemCounts = new HashMap<>();
        for (Set<Long> basket : transactions) {
            basket.forEach(id -> itemCounts.merge(id, 1L, Long::sum));
        }
        long targetCount = itemCounts.getOrDefault(targetId, 0L);
        if (targetCount < minCount) return List.of();

        Set<Long> frequentItems = itemCounts.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(targetId) && entry.getValue() >= minCount)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        // 3. C2: nối A với từng B trong L1, rồi đếm các cặp trong giỏ chứa A.
        Map<Long, Long> pairCounts = new HashMap<>();
        for (Set<Long> basket : transactions) {
            if (!basket.contains(targetId)) continue;
            for (Long candidateId : basket) {
                if (frequentItems.contains(candidateId)) pairCounts.merge(candidateId, 1L, Long::sum);
            }
        }

        // 4. L2: giữ cặp đủ support; sinh luật A -> B đủ confidence và lift.
        List<AssociationRule> rules = new ArrayList<>();
        for (Map.Entry<Long, Long> pair : pairCounts.entrySet()) {
            long countAB = pair.getValue();
            if (countAB < minCount) continue;

            double support = countAB / (double) transactionCount;
            double confidence = countAB / (double) targetCount;
            double supportB = itemCounts.get(pair.getKey()) / (double) transactionCount;
            double lift = confidence / supportB;

            // Lift > 1: mua A làm B xuất hiện thường xuyên hơn mức phổ biến chung của B.
            if (confidence >= MIN_CONFIDENCE && lift > MIN_LIFT) {
                rules.add(new AssociationRule(pair.getKey(), countAB, support, confidence, lift));
            }
        }

        // 5. Ưu tiên xác suất mua kèm, rồi mức liên kết; dùng ID để xử lý cùng điểm.
        return rules.stream()
                .sorted(Comparator.comparingDouble(AssociationRule::confidence).reversed()
                        .thenComparing(Comparator.comparingDouble(AssociationRule::lift).reversed())
                        .thenComparing(AssociationRule::productId))
                .toList();
    }

    record AssociationRule(Long productId, long orderCount, double support, double confidence, double lift) {}
}
