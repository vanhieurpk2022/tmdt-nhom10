package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.model.Product;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/** Gợi ý theo nội dung: đặc trưng sản phẩm -> TF-IDF -> Cosine -> Top-K. */
@Service
public class ProductRecommendationService {
    private static final double MIN_SIMILARITY = 0.20;
    private static final Pattern ACCENTS = Pattern.compile("\\p{M}+");
    private static final Set<String> STOP_WORDS = Set.of(
            "tinh", "dau", "nguyen", "chat", "lieu", "huong", "va", "cua", "tu", "cho", "voi", "ml");

    // Nhóm hương quy ước dùng cho tìm kiếm, ưu tiên tên sản phẩm.
    private static final Map<String, String> SCENT_FAMILIES = new LinkedHashMap<>();
    private static final List<String> SCENT_KEYWORDS;
    private static final List<String> USE_KEYWORDS = List.of(
            "thu gian", "ngu ngon", "giam stress", "khu mui", "duoi muoi",
            "khang khuan", "duong da", "duong toc", "massage", "tap trung");
    private static final List<String> COMPOUND_KEYWORDS = List.of(
            "linalool", "linalyl acetate", "limonene", "citral", "citronellal",
            "citronellol", "geraniol", "menthol", "eucalyptol", "cineole",
            "eugenol", "nerolidol", "fokienol", "zingiberene");

    static {
        mapFamily("hoa", "hoa hong", "hoa lai", "hoa nhai", "hoa cam", "ngoc lan tay",
                "oai huong", "lavender", "ylang", "phong lu", "sa hoa hong", "palmarosa");
        mapFamily("cam_chanh", "cam ngot", "chanh", "quyt", "buoi", "bergamot", "sa chanh");
        mapFamily("thao_moc", "bac ha", "peppermint", "spearmint", "khuynh diep", "bach dan",
                "tram gio", "tram tra", "tra xanh", "hung que", "huong nhu", "sa java", "loc de xanh");
        mapFamily("go", "go hong", "po mu", "trac bach diep", "tuyet tung", "dan huong", "go thong");
        mapFamily("gia_vi", "gung", "que", "dinh huong", "nhuc dau khau", "nghe",
                "tinh dau hoi", "dai hoi", "star anise");
        mapFamily("nhua_cay", "nhu huong", "tram huong", "frankincense", "myrrh");
        mapFamily("dau_nen", "dau dua", "dau bo", "jojoba", "argan", "hanh nhan",
                "macadamia", "huong duong", "olive", "cam gao", "dau gac", "avocado");

        // Khớp cụm dài trước: "sả hoa hồng" không bị tách thành "hoa hồng".
        SCENT_KEYWORDS = SCENT_FAMILIES.keySet().stream()
                .sorted(Comparator.comparingInt(String::length).reversed().thenComparing(String::compareTo))
                .toList();
    }

    public List<Product> findSimilarProducts(Product target, List<Product> catalog, int limit) {
        if (target == null || target.getId() == null || catalog == null || limit <= 0) return List.of();

        // 1. Chỉ giữ sản phẩm đang mở bán, có dung tích còn hàng và không phải chính sản phẩm đang xem.
        List<Product> candidates = catalog.stream()
                .filter(RecommendationEligibility::isAvailable)
                .filter(product -> !product.getId().equals(target.getId()))
                .toList();
        if (candidates.isEmpty()) return List.of();

        List<Product> corpus = new ArrayList<>(candidates);
        corpus.add(target);

        // 2. Trích xuất đặc trưng và đếm số sản phẩm chứa từng đặc trưng.
        Map<Long, Map<String, Double>> features = new HashMap<>();
        Map<String, Integer> documentCounts = new HashMap<>();
        for (Product product : corpus) {
            Map<String, Double> terms = extractFeatures(product);
            features.put(product.getId(), terms);
            terms.keySet().forEach(term -> documentCounts.merge(term, 1, Integer::sum));
        }

        // 3. TF-IDF có làm trơn: trọng số * [log((N + 1) / (df + 1)) + 1].
        Map<Long, Map<String, Double>> vectors = new HashMap<>();
        for (Product product : corpus) {
            Map<String, Double> vector = new HashMap<>();
            features.get(product.getId()).forEach((term, weight) -> {
                double idf = Math.log((corpus.size() + 1.0) / (documentCounts.get(term) + 1.0)) + 1.0;
                vector.put(term, weight * idf);
            });
            vectors.put(product.getId(), vector);
        }

        // 4. Tính Cosine; loại trường hợp chỉ giống danh mục hoặc dung tích.
        Map<String, Double> targetFeatures = features.get(target.getId());
        List<ScoredProduct> scored = new ArrayList<>();
        for (Product candidate : candidates) {
            if (!sharesContent(targetFeatures, features.get(candidate.getId()))) continue;
            double score = cosine(vectors.get(target.getId()), vectors.get(candidate.getId()));
            if (score >= MIN_SIMILARITY) scored.add(new ScoredProduct(candidate, score));
        }

        // 5. Điểm giảm dần; cùng điểm thì dùng ID để kết quả ổn định.
        return scored.stream()
                .sorted(Comparator.comparingDouble(ScoredProduct::score).reversed()
                        .thenComparing(result -> result.product().getId()))
                .limit(limit)
                .map(ScoredProduct::product)
                .toList();
    }

    private Map<String, Double> extractFeatures(Product product) {
        Map<String, Double> terms = new HashMap<>();
        String name = normalize(product.getName());
        String description = normalize(product.getDescription());

        Set<String> scentKeywords = matchScents(name, false);
        if (scentKeywords.isEmpty()) scentKeywords = matchScents(description, true);
        for (String keyword : scentKeywords) {
            terms.put("scent_" + keyword, 4.0);
            terms.put("family_" + SCENT_FAMILIES.get(keyword), 3.5);
        }

        for (String word : name.split(" ")) {
            if (word.length() >= 2 && !STOP_WORDS.contains(word) && !word.matches("\\d+")) {
                terms.merge("name_" + word, 2.0, Double::sum);
            }
        }

        String content = name + " " + description;
        COMPOUND_KEYWORDS.stream().filter(keyword -> containsPhrase(content, keyword))
                .forEach(keyword -> terms.put("compound_" + keyword, 1.5));
        USE_KEYWORDS.stream().filter(keyword -> containsPhrase(content, keyword))
                .forEach(keyword -> terms.put("use_" + keyword, 1.0));

        if (product.getCategory() != null && product.getCategory().getName() != null) {
            terms.put("category_" + normalize(product.getCategory().getName()), 0.5);
        }
        if (product.getProductMils() != null) {
            product.getProductMils().stream()
                    .filter(RecommendationEligibility::isAvailableVariant)
                    .forEach(variant -> terms.put("volume_" + variant.getMil(), 0.25));
        }
        return terms;
    }

    private boolean containsPhrase(String text, String phrase) {
        return (" " + text + " ").contains(" " + phrase + " ");
    }

    private Set<String> matchScents(String text, boolean descriptionOnly) {
        Set<String> matches = new LinkedHashSet<>();
        String remaining = " " + text + " ";
        for (String keyword : SCENT_KEYWORDS) {
            // Trong mô tả chỉ xét cụm từ; tránh "hồi" trong "phục hồi", "bơ" trong "bổ sung".
            if (descriptionOnly && !keyword.contains(" ")) continue;
            String phrase = " " + keyword + " ";
            if (remaining.contains(phrase)) {
                matches.add(keyword);
                remaining = remaining.replace(phrase, " ");
            }
        }
        return matches;
    }

    private boolean sharesContent(Map<String, Double> left, Map<String, Double> right) {
        return left.keySet().stream().anyMatch(term ->
                !term.startsWith("category_") && !term.startsWith("volume_") && right.containsKey(term));
    }

    private double cosine(Map<String, Double> left, Map<String, Double> right) {
        double dot = left.entrySet().stream()
                .mapToDouble(entry -> entry.getValue() * right.getOrDefault(entry.getKey(), 0.0)).sum();
        double leftNorm = Math.sqrt(left.values().stream().mapToDouble(value -> value * value).sum());
        double rightNorm = Math.sqrt(right.values().stream().mapToDouble(value -> value * value).sum());
        return leftNorm == 0 || rightNorm == 0 ? 0 : dot / (leftNorm * rightNorm);
    }

    private static void mapFamily(String family, String... keywords) {
        for (String keyword : keywords) SCENT_FAMILIES.put(keyword, family);
    }

    private String normalize(String text) {
        if (text == null) return "";
        return ACCENTS.matcher(Normalizer.normalize(text, Normalizer.Form.NFD)).replaceAll("")
                .replace('đ', 'd').replace('Đ', 'D').toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private record ScoredProduct(Product product, double score) {}
}

