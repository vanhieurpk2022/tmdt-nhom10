package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Dịch vụ gợi ý sản phẩm tương tự dựa trên đặc trưng nốt hương và Cosine Similarity.
 *
 * Thuật toán:
 *   1. Trích xuất đặc trưng mùi hương (tầng hương/họ hương: hoa, cam chanh, thảo mộc, gỗ, gia vị, nhựa cây, dầu nền),
 *      công dụng trị liệu và dải dung tích từ dữ liệu sản phẩm trong cơ sở dữ liệu.
 *   2. Vector hóa các thuộc tính thành không gian đặc trưng TF-IDF (Term Frequency - Inverse Document Frequency).
 *   3. Tính toán độ tương đồng Cosine (Cosine Similarity):
 *          cos_sim(u, v) = (u . v) / (||u|| * ||v||)
 *   4. Xếp hạng và đề xuất Top-K sản phẩm có độ tương đồng nốt hương cao nhất.
 */
@Service
public class ProductRecommendationService {

    // Danh mục các từ khóa đặc trưng nốt hương / họ hương chuẩn hóa
    private static final Map<String, String> SCENT_FAMILY_MAP = new LinkedHashMap<>();

    // Danh mục từ khóa công dụng trị liệu
    private static final List<String> THERAPY_KEYWORDS = List.of(
            "thu gian", "ngu ngon", "giam stress", "khu mui", "duoi muoi",
            "khang khuan", "duong da", "duong toc", "massage", "tang tap trung",
            "giam dau", "chong oxy hoa", "thong mui", "giai cam", "tinh than",
            "sang khoai", "am ap", "diu mat", "thanh loc"
    );

    static {
        // Họ hương hoa (Floral)
        mapScent("hoa", "hoa hong", "hoa lai", "hoa cam", "ngoc lan tay", "oai huong", "lavender", "ylang", "phong lu", "hoa nhai");

        // Họ hương trái cây / Cam chanh (Citrus & Fruity)
        mapScent("trai_cay", "cam ngot", "chanh", "quyt", "buoi", "bergamot", "sa chanh", "limonene", "citral", "citronellal");

        // Họ hương thảo mộc / Tươi mát (Herbal & Fresh)
        mapScent("thao_moc", "bac ha", "khuynh diep", "tram gio", "tram tra", "tra xanh", "hung que", "huong nhu", "bach dan", "eucalyptol", "menthol", "cineole");

        // Họ hương gỗ (Woody & Earthy)
        mapScent("go", "go hong", "po mu", "trac bach diep", "tuyet tung", "dan huong", "nerolidol", "sesquiterpenes", "fokienol", "linalool");

        // Họ hương gia vị / Ấm nồng (Spicy & Warm)
        mapScent("gia_vi", "gung", "que", "dinh huong", "hoi", "nhuc dau khau", "nghe", "zingiberene", "eugenol", "curcumin");

        // Họ hương nhựa cây / Trầm (Balsamic & Resinous)
        mapScent("nhua_cay", "nhu huong", "frankincense", "myrrh", "loc de xanh", "sa hoa hong");

        // Dầu nền dưỡng da (Carrier Oil)
        mapScent("dau_nen", "jojoba", "argan", "dua", "hanh nhan", "macadamia", "huong duong", "olive", "bo");
    }

    private static void mapScent(String family, String... keywords) {
        for (String kw : keywords) {
            SCENT_FAMILY_MAP.put(kw, family);
        }
    }

    /**
     * Tìm Top-K sản phẩm tương tự với sản phẩm chỉ định dựa trên độ đo tương đồng Cosine.
     *
     * @param targetProduct Sản phẩm đang xem chi tiết
     * @param allCandidates Danh sách tất cả sản phẩm ứng viên từ cơ sở dữ liệu
     * @param limit         Số lượng sản phẩm tương tự cần lấy
     * @return Danh sách sản phẩm tương đồng nhất xếp theo độ tương tự giảm dần
     */
    public List<Product> findSimilarProducts(Product targetProduct, List<Product> allCandidates, int limit) {
        if (targetProduct == null || allCandidates == null || allCandidates.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Thu thập danh sách sản phẩm ứng viên (loại trừ chính targetProduct)
        List<Product> candidates = allCandidates.stream()
                .filter(p -> p.getId() != null && !p.getId().equals(targetProduct.getId()))
                .toList();

        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        // Tập hợp toàn bộ mẫu (gồm target và các candidates) để xây dựng từ điển TF-IDF
        List<Product> corpus = new ArrayList<>();
        corpus.add(targetProduct);
        corpus.addAll(candidates);

        // 2. Trích xuất thuộc tính có trọng số cho từng sản phẩm
        Map<Long, Map<String, Double>> productTermWeights = new HashMap<>();
        Set<String> vocabulary = new HashSet<>();
        Map<String, Integer> documentFrequency = new HashMap<>();

        for (Product product : corpus) {
            Map<String, Double> termFreq = extractWeightedTerms(product);
            productTermWeights.put(product.getId(), termFreq);
            vocabulary.addAll(termFreq.keySet());

            for (String term : termFreq.keySet()) {
                documentFrequency.put(term, documentFrequency.getOrDefault(term, 0) + 1);
            }
        }

        // 3. Xây dựng vector TF-IDF cho từng sản phẩm
        int totalDocs = corpus.size();
        List<String> featureList = new ArrayList<>(vocabulary);

        Map<Long, double[]> tfidfVectors = new HashMap<>();
        for (Product product : corpus) {
            Map<String, Double> termFreq = productTermWeights.get(product.getId());
            double[] vector = new double[featureList.size()];

            for (int i = 0; i < featureList.size(); i++) {
                String term = featureList.get(i);
                double tf = termFreq.getOrDefault(term, 0.0);
                if (tf > 0) {
                    int df = documentFrequency.getOrDefault(term, 1);
                    double idf = Math.log(1.0 + ((double) totalDocs / (1.0 + df)));
                    vector[i] = tf * idf;
                }
            }
            tfidfVectors.put(product.getId(), vector);
        }

        // 4. Tính Cosine Similarity giữa targetProduct và từng candidate
        double[] targetVector = tfidfVectors.get(targetProduct.getId());
        Long targetCategoryId = targetProduct.getCategory() != null ? targetProduct.getCategory().getId() : null;

        List<ScoredProduct> scored = new ArrayList<>();
        for (Product candidate : candidates) {
            double[] candidateVector = tfidfVectors.get(candidate.getId());
            double similarity = calculateCosineSimilarity(targetVector, candidateVector);

            // Ưu tiên cộng điểm nhỏ cho sản phẩm cùng danh mục
            if (targetCategoryId != null && candidate.getCategory() != null
                    && targetCategoryId.equals(candidate.getCategory().getId())) {
                similarity += 0.12;
            }

            scored.add(new ScoredProduct(candidate, similarity));
        }

        // 5. Sắp xếp giảm dần theo điểm tương đồng và lấy top-K
        scored.sort((a, b) -> Double.compare(b.score, a.score));

        return scored.stream()
                .limit(Math.max(1, limit))
                .map(sp -> sp.product)
                .toList();
    }

    /**
     * Trích xuất các đặc trưng mùi hương, công dụng và dung tích kèm hệ số trọng số:
     *   - Đặc trưng tầng hương (hệ số x4.0)
     *   - Danh mục (hệ số x3.0)
     *   - Công dụng trị liệu (hệ số x2.5)
     *   - Nhà xưởng / Nhà cung cấp (hệ số x2.0)
     *   - Dải dung tích (hệ số x1.5)
     *   - Từ khóa tên sản phẩm (hệ số x2.0)
     */
    private Map<String, Double> extractWeightedTerms(Product product) {
        Map<String, Double> termWeights = new HashMap<>();

        String name = normalizeText(product.getName());
        String description = normalizeText(product.getDescription());
        String combined = name + " " + description;

        // 1. Nhóm mùi hương / Tầng hương (Trọng số cao: 4.0)
        for (Map.Entry<String, String> entry : SCENT_FAMILY_MAP.entrySet()) {
            if (combined.contains(entry.getKey())) {
                addTerm(termWeights, "scent_kw_" + entry.getKey().replace(" ", "_"), 3.0);
                addTerm(termWeights, "scent_family_" + entry.getValue(), 4.0);
            }
        }

        // 2. Danh mục sản phẩm (Trọng số 3.0)
        if (product.getCategory() != null && product.getCategory().getName() != null) {
            String catName = normalizeText(product.getCategory().getName());
            addTerm(termWeights, "cat_" + catName.replace(" ", "_"), 3.0);
        }

        // 3. Công dụng trị liệu (Trọng số 2.5)
        for (String therapy : THERAPY_KEYWORDS) {
            if (combined.contains(therapy)) {
                addTerm(termWeights, "therapy_" + therapy.replace(" ", "_"), 2.5);
            }
        }

        // 4. Nhà xưởng (Trọng số 2.0)
        if (product.getFactory() != null && product.getFactory().getName() != null) {
            String facName = normalizeText(product.getFactory().getName());
            addTerm(termWeights, "fac_" + facName.replace(" ", "_"), 2.0);
        }

        // 5. Dải dung tích (Trọng số 1.5)
        if (product.getProductMils() != null) {
            for (ProductMil mil : product.getProductMils()) {
                addTerm(termWeights, "mil_" + mil.getMil() + "ml", 1.5);
            }
        }

        // 6. Token từ tên sản phẩm (Trọng số 2.0)
        String[] words = name.split("\\s+");
        for (String w : words) {
            if (w.length() >= 2 && !isStopWord(w)) {
                addTerm(termWeights, "word_" + w, 2.0);
            }
        }

        return termWeights;
    }

    private void addTerm(Map<String, Double> map, String term, double weight) {
        map.put(term, map.getOrDefault(term, 0.0) + weight);
    }

    /**
     * Tính toán Cosine Similarity giữa 2 vector:
     *   cosine = (u . v) / (||u|| * ||v||)
     */
    private double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length != vectorB.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Chuẩn hóa văn bản tiếng Việt (loại bỏ dấu và chuyển chữ thường để so khớp chính xác).
     */
    private String normalizeText(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noAccent = pattern.matcher(normalized).replaceAll("")
                .replace("đ", "d").replace("Đ", "D")
                .toLowerCase();
        return noAccent.replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private boolean isStopWord(String word) {
        return Set.of("la", "va", "cua", "cac", "nhung", "mot", "duoc", "cho", "trong", "co", "tu", "voi", "tinh", "dau")
                .contains(word);
    }

    private record ScoredProduct(Product product, double score) {}
}

