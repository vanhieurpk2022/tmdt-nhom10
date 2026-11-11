package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.model.Product;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Dịch vụ gợi ý "Mua kèm thường xuyên / Phối hương đi kèm" (Frequently Bought Together).
 *
 * Thuật toán 2 tầng:
 *   Tầng 1 (Khai phá luật kết hợp Apriori từ đơn hàng thực tế):
 *     - Tìm các giỏ hàng chứa sản phẩm mục tiêu (Support A).
 *     - Đếm tần suất sản phẩm B đồng xuất hiện trong các đơn đó (Support AB).
 *     - Xếp hạng theo Confidence = Support(AB) / Support(A).
 *
 *   Tầng 2 (Bổ trợ phối hương theo vòng tròn mùi hương Aromatherapy Blending Wheel):
 *     - Khi sản phẩm chưa có đủ lịch sử đơn hàng (cold start), tự động phân tích
 *       họ hương của sản phẩm và đề xuất các nhóm mùi hương bổ trợ đối xứng:
 *         + Cam chanh (Citrus) <-> Thảo mộc (Herbal), Gia vị (Spicy), Dầu nền (Carrier).
 *         + Thảo mộc (Herbal) <-> Cam chanh (Citrus), Gỗ (Woody), Dầu nền (Carrier).
 *         + Hương hoa (Floral) <-> Hương gỗ (Woody), Cam chanh (Citrus), Dầu nền (Carrier).
 *         + Hương gỗ (Woody) <-> Hương hoa (Floral), Cam chanh (Citrus), Gia vị (Spicy).
 *         + Gia vị (Spicy) <-> Cam chanh (Citrus), Gỗ (Woody), Hương hoa (Floral).
 *     - Giúp mỗi sản phẩm luôn có danh sách gợi ý mua kèm phối hương độc bản, riêng biệt.
 */
@Service
@Transactional(readOnly = true)
public class FrequentlyBoughtTogetherService {

    @PersistenceContext
    private EntityManager em;

    // Bảng tra cứu từ khóa họ hương
    private static final Map<String, String> SCENT_MAP = new LinkedHashMap<>();

    // Vòng tròn phối hương bổ trợ đối xứng (Complementary Aromatherapy Blending Wheel)
    private static final Map<String, Set<String>> COMPLEMENTARY_RULES = Map.of(
            "trai_cay", Set.of("thao_moc", "gia_vi", "hoa", "dau_nen"),
            "thao_moc", Set.of("trai_cay", "go", "dau_nen", "gia_vi"),
            "hoa", Set.of("go", "trai_cay", "dau_nen", "hoa"),
            "go", Set.of("hoa", "trai_cay", "gia_vi", "dau_nen"),
            "gia_vi", Set.of("trai_cay", "go", "hoa", "dau_nen"),
            "nhua_cay", Set.of("hoa", "trai_cay", "go", "dau_nen"),
            "dau_nen", Set.of("hoa", "trai_cay", "thao_moc", "go")
    );

    static {
        // Họ hương hoa
        mapScent("hoa", "hoa hong", "hoa lai", "hoa cam", "ngoc lan tay", "oai huong", "lavender", "ylang", "phong lu", "hoa nhai");
        // Họ hương cam chanh / trái cây
        mapScent("trai_cay", "cam ngot", "chanh", "quyt", "buoi", "bergamot", "sa chanh", "limonene", "citral", "citronellal");
        // Họ hương thảo mộc
        mapScent("thao_moc", "bac ha", "khuynh diep", "tram gio", "tram tra", "tra xanh", "hung que", "huong nhu", "bach dan", "eucalyptol", "menthol");
        // Họ hương gỗ
        mapScent("go", "go hong", "po mu", "trac bach diep", "tuyet tung", "dan huong", "thong", "pine");
        // Họ hương gia vị
        mapScent("gia_vi", "gung", "que", "dinh huong", "hoi", "nhuc dau khau", "nghe");
        // Dầu nền
        mapScent("dau_nen", "jojoba", "argan", "dua", "hanh nhan", "macadamia", "huong duong", "cam gao", "olive");
    }

    private static void mapScent(String family, String... keywords) {
        for (String kw : keywords) {
            SCENT_MAP.put(kw, family);
        }
    }

    /**
     * Tìm Top-K sản phẩm thường mua kèm hoặc phối hương bổ trợ với sản phẩm chỉ định.
     */
    @SuppressWarnings("unchecked")
    public List<Product> findBoughtTogether(Long productId, int limit) {
        if (productId == null || limit <= 0) return Collections.emptyList();

        // 1. Tầng 1: Khai phá dữ liệu giỏ hàng thực tế bằng Apriori
        List<Long> orderIds = em.createQuery(
                        "SELECT DISTINCT oi.order.id FROM OrderItem oi WHERE oi.product.id = :pid",
                        Long.class)
                .setParameter("pid", productId)
                .getResultList();

        if (!orderIds.isEmpty()) {
            List<Object[]> rows = em.createQuery(
                            "SELECT oi.product, COUNT(DISTINCT oi.order.id) AS supportAB " +
                            "FROM OrderItem oi " +
                            "WHERE oi.order.id IN :orderIds " +
                            "  AND oi.product.id <> :pid " +
                            "  AND (oi.product.status = :active OR oi.product.status IS NULL) " +
                            "GROUP BY oi.product " +
                            "ORDER BY supportAB DESC",
                            Object[].class)
                    .setParameter("orderIds", orderIds)
                    .setParameter("pid", productId)
                    .setParameter("active", ProductStatus.ACTIVE)
                    .setMaxResults(limit * 3)
                    .getResultList();

            List<Product> mined = rows.stream()
                    .map(row -> (Product) row[0])
                    .filter(this::hasAvailableVariant)
                    .limit(limit)
                    .toList();

            if (!mined.isEmpty()) {
                return mined;
            }
        }

        // 2. Tầng 2: Fallback bổ trợ phối hương thông minh theo vòng tròn hương liệu
        Product target = em.find(Product.class, productId);
        if (target == null) return Collections.emptyList();

        List<Product> allCandidates = em.createQuery(
                        "SELECT p FROM Product p WHERE (p.status = :active OR p.status IS NULL) AND p.id <> :pid AND (p.productType = 'NORMAL' OR p.productType IS NULL)",
                        Product.class)
                .setParameter("active", ProductStatus.ACTIVE)
                .setParameter("pid", productId)
                .getResultList();

        return findComplementaryScents(target, allCandidates, limit);
    }

    /**
     * Gợi ý phối hương bổ trợ theo quy tắc Aromatherapy Blending Wheel
     */
    private List<Product> findComplementaryScents(Product target, List<Product> candidates, int limit) {
        String targetFamily = detectScentFamily(target);
        Set<String> targetComplFamilies = COMPLEMENTARY_RULES.getOrDefault(targetFamily, Set.of("dau_nen", "thao_moc", "trai_cay"));

        // Chấm điểm từng sản phẩm ứng viên
        List<ScoredCandidate> scored = new ArrayList<>();
        for (Product candidate : candidates) {
            if (!hasAvailableVariant(candidate)) continue;

            String candidateFamily = detectScentFamily(candidate);
            double score = 0.0;

            // Điểm ăn khớp họ hương bổ trợ
            if (targetComplFamilies.contains(candidateFamily)) {
                score += 3.0;
            }

            // Ưu tiên kèm ít nhất dầu nền dưỡng hoặc danh mục khác để tạo combo phối hương hoàn chỉnh
            if ("dau_nen".equals(candidateFamily)) {
                score += 1.5;
            }

            // Điểm uy tín / bán chạy nội bộ nhóm
            long totalSold = candidate.getTotalSold() != null ? candidate.getTotalSold() : 0L;
            score += Math.min(totalSold * 0.01, 1.0);

            // Điểm băm ID để phân tán tự nhiên giữa các sản phẩm cùng nhóm, tránh bị trùng lặp
            double hashOffset = Math.abs((target.getId() * 31 + candidate.getId()) % 17) * 0.05;
            score += hashOffset;

            scored.add(new ScoredCandidate(candidate, score));
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        return scored.stream()
                .limit(limit)
                .map(sc -> sc.product)
                .toList();
    }

    private String detectScentFamily(Product p) {
        String text = normalizeText((p.getName() != null ? p.getName() : "") + " " + (p.getDescription() != null ? p.getDescription() : ""));
        for (Map.Entry<String, String> entry : SCENT_MAP.entrySet()) {
            if (text.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        // Kiểm tra danh mục
        if (p.getCategory() != null && p.getCategory().getName() != null) {
            String catName = normalizeText(p.getCategory().getName());
            if (catName.contains("dau nen")) return "dau_nen";
        }
        return "trai_cay"; // mặc định
    }

    private boolean hasAvailableVariant(Product p) {
        if (p.getProductMils() == null || p.getProductMils().isEmpty()) return true;
        return p.getProductMils().stream()
                .anyMatch(m -> m.isActive() && m.getStockQuantity() > 0);
    }

    private String normalizeText(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noAccent = pattern.matcher(normalized).replaceAll("")
                .replace("đ", "d").replace("Đ", "D")
                .toLowerCase();
        return noAccent.replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private record ScoredCandidate(Product product, double score) {}
}
