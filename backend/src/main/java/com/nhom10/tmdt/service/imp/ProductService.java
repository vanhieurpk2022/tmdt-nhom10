package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.product.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.CategoryRepository;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.ProductRepository;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private static final int DEFAULT_HOME_PRODUCT_LIMIT = 4;
    private static final int MAX_HOME_PRODUCT_LIMIT = 12;

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final FactoryRepository factoryRepo;

    public ProductService(
            ProductRepository productRepo,
            CategoryRepository categoryRepo,
            FactoryRepository factoryRepo
    ) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.factoryRepo = factoryRepo;
    }

    // Lấy metadata cho sidebar
    public FilterMetaResponse getFilterMeta() {
        // Đếm sản phẩm theo category
        Map<Long, Long> catCount = productRepo.countByCategory().stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        List<CategoryDto> categories = categoryRepo.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), catCount.getOrDefault(c.getId(), 0L)))
                .filter(c -> c.productCount() > 0)
                .toList();

        // Đếm sản phẩm theo factory
        Map<Long, Long> facCount = productRepo.countByFactory().stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        List<FactoryDto> factories = factoryRepo.findAll().stream()
                .map(f -> {
                    String avatarUrl = null;
                    if (f.getFactoryImages() != null && !f.getFactoryImages().isEmpty()) {
                        avatarUrl = f.getFactoryImages().stream()
                                .filter(img -> img.isAvatar() && img.getImageUrl() != null && !img.getImageUrl().isBlank())
                                .map(img -> img.getImageUrl())
                                .findFirst()
                                .orElse(f.getFactoryImages().get(0).getImageUrl());
                    }
                    return new FactoryDto(f.getId(), f.getName(), facCount.getOrDefault(f.getId(), 0L), avatarUrl);
                })
                .filter(f -> f.productCount() > 0)
                .toList();

        return new FilterMetaResponse(categories, factories);
    }

    // Lọc & phân trang sản phẩm
    public ProductPageResponse filterProducts(ProductFilterRequest req) {
        Specification<Product> spec = buildSpec(req);

        // Thứ tự bán chạy phải dùng cùng một giá trị với totalSold hiển thị trên card.
        // Một số dữ liệu cũ chưa có product.total_sold nên không thể sắp xếp trực tiếp bằng SQL.
        if ("bestseller".equalsIgnoreCase(req.sort())) {
            return filterBySales(spec, req);
        }

        Sort sort = buildSort(req.sort());
        Pageable pageable = PageRequest.of(req.page(), req.size(), sort);

        Page<Product> page = productRepo.findAll(spec, pageable);

        List<ProductCardResponse> cards = page.getContent().stream()
                .map(this::toCard)
                .toList();

        return new ProductPageResponse(cards, page.getTotalElements(), page.getTotalPages(), page.getNumber());
    }

    // Product sections for the home page
    public List<ProductCardResponse> getNewestProducts(Integer limit) {
        Pageable pageable = PageRequest.of(0, normalizeHomeProductLimit(limit));
        return productRepo.findNewestProducts(pageable).stream()
                .map(this::toCard)
                .toList();
    }

    public List<ProductCardResponse> getBestSellerProducts(Integer limit) {
        int productLimit = normalizeHomeProductLimit(limit);
        return productRepo.findAll().stream()
                .sorted(this::compareBySales)
                .limit(productLimit)
                .map(this::toCard)
                .toList();
    }

    private ProductPageResponse filterBySales(Specification<Product> spec, ProductFilterRequest req) {
        List<Product> filteredProducts = productRepo.findAll(spec).stream()
                .sorted(this::compareBySales)
                .toList();

        int page = Math.max(req.page(), 0);
        int size = req.size() > 0 ? req.size() : 12;
        int fromIndex = Math.min(page * size, filteredProducts.size());
        int toIndex = Math.min(fromIndex + size, filteredProducts.size());

        List<ProductCardResponse> cards = filteredProducts.subList(fromIndex, toIndex).stream()
                .map(this::toCard)
                .toList();
        int totalPages = (int) Math.ceil((double) filteredProducts.size() / size);

        return new ProductPageResponse(cards, filteredProducts.size(), totalPages, page);
    }

    private int compareBySales(Product left, Product right) {
        int salesComparison = Long.compare(resolveTotalSold(right), resolveTotalSold(left));
        if (salesComparison != 0) {
            return salesComparison;
        }

        Long leftId = left.getId();
        Long rightId = right.getId();
        return Long.compare(rightId == null ? 0 : rightId, leftId == null ? 0 : leftId);
    }

    private int normalizeHomeProductLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_HOME_PRODUCT_LIMIT;
        }
        return Math.min(limit, MAX_HOME_PRODUCT_LIMIT);
    }

    // Build JPA Specification từ filter request
    private Specification<Product> buildSpec(ProductFilterRequest req) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Lọc theo danh mục
            if (req.categoryIds() != null && !req.categoryIds().isEmpty()) {
                predicates.add(root.get("category").get("id").in(req.categoryIds()));
            }

            // Lọc theo gian hàng
            if (req.factoryIds() != null && !req.factoryIds().isEmpty()) {
                predicates.add(root.get("factory").get("id").in(req.factoryIds()));
            }

            // Lọc theo khoảng giá (dùng min_price của product)
            if (req.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), req.minPrice()));
            }
            if (req.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), req.maxPrice()));
            }

            // Lọc theo rating trung bình
            if (req.minRating() != null) {
                // Subquery: AVG(review.rating) cho product này
                Subquery<Double> ratingSubquery = query.subquery(Double.class);
                Root<Review> reviewRoot = ratingSubquery.from(Review.class);
                ratingSubquery.select(cb.avg(reviewRoot.get("rating")))
                        .where(cb.equal(reviewRoot.get("product"), root));
                predicates.add(cb.greaterThanOrEqualTo(ratingSubquery, (double) req.minRating()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Build Sort từ tham số sort
    private Sort buildSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.ASC, "id");
        return switch (sort) {
            case "price-asc"  -> Sort.by(Sort.Direction.ASC, "price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
            default           -> Sort.by(Sort.Direction.ASC, "id"); // popular / mặc định: ID tăng dần
        };
    }

    /**
     * Dùng chung cho xếp hạng và số liệu hiển thị trên card.
     * Dữ liệu cũ chưa có total_sold nên giữ fallback hiện tại để không làm mất số liệu giao diện.
     */
    private long resolveTotalSold(Product product) {
        if (product.getTotalSold() != null && product.getTotalSold() > 0) {
            return product.getTotalSold();
        }

        long productId = product.getId() == null ? 0 : product.getId();
        long reviewCount = product.getReviews() == null ? 0 : product.getReviews().size();
        return reviewCount > 0
                ? reviewCount * 35L + ((productId * 11) % 40)
                : 15L + (productId % 20);
    }

    // Chuyển Product entity sang DTO ProductCardResponse
    private ProductCardResponse toCard(Product p) {
        // Ảnh thumbnail: lấy ảnh đầu tiên
        String thumbnail = (p.getProductImages() != null && !p.getProductImages().isEmpty())
                ? p.getProductImages().get(0).getImageUrl()
                : null;

        // Rating trung bình
        double avgRating = 0;
        if (p.getReviews() != null && !p.getReviews().isEmpty()) {
            avgRating = p.getReviews().stream()
                    .mapToInt(Review::getRating).average().orElse(0);
        }

        // Tổng số đã bán
        long totalSold = resolveTotalSold(p);

        // Tình trạng kho: tổng stockQuantity từ tất cả ProductMil
        int totalStock = 0;
        if (p.getProductMils() != null) {
            totalStock = p.getProductMils().stream()
                    .mapToInt(ProductMil::getStockQuantity).sum();
        }
        String stockStatus = totalStock > 10 ? "Còn hàng" : totalStock > 0 ? "Sắp hết" : "Hết hàng";

        // Discount rate từ sale hiện tại
        double discountRate = (p.getSale() != null) ? p.getSale().getDiscountRate() : 0;

        // Giá hiển thị: nếu min_price null thì lấy min từ productMils
        Double displayPrice = p.getPrice();
        Double displayBasePrice = p.getMinBasePrice();
        if ((displayPrice == null || displayPrice == 0) && p.getProductMils() != null && !p.getProductMils().isEmpty()) {
            displayPrice = p.getProductMils().stream()
                    .map(ProductMil::getPrice)
                    .filter(java.util.Objects::nonNull)
                    .filter(pr -> pr > 0)
                    .min(Double::compareTo)
                    .orElse(null);
        }
        if ((displayBasePrice == null || displayBasePrice == 0) && p.getProductMils() != null && !p.getProductMils().isEmpty()) {
            displayBasePrice = p.getProductMils().stream()
                    .map(ProductMil::getBasePrice)
                    .filter(java.util.Objects::nonNull)
                    .filter(pr -> pr > 0)
                    .min(Double::compareTo)
                    .orElse(null);
        }
        if (displayPrice == null) displayPrice = displayBasePrice;
        if (displayBasePrice == null) displayBasePrice = displayPrice;

        return new ProductCardResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getFactory() != null ? p.getFactory().getName() : null,
                displayPrice,
                displayBasePrice,
                discountRate,
                Math.round(avgRating * 10.0) / 10.0,
                totalSold,
                stockStatus,
                thumbnail
        );
    }

    public ProductDetailResponse getProductDetail(Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với id: " + id));

        // Danh sách đường dẫn hình ảnh chi tiết của sản phẩm
        List<String> imageUrls = (p.getProductImages() != null && !p.getProductImages().isEmpty())
                ? p.getProductImages().stream().map(ProductImage::getImageUrl).filter(Objects::nonNull).toList()
                : Collections.emptyList();

        // Tính điểm đánh giá trung bình và tổng số đánh giá
        double avgRating = 0;
        int reviewCount = 0;
        if (p.getReviews() != null && !p.getReviews().isEmpty()) {
            reviewCount = p.getReviews().size();
            avgRating = p.getReviews().stream()
                    .mapToInt(Review::getRating).average().orElse(0);
        }

        // Tính tổng số lượng đã bán
        long totalSold = resolveTotalSold(p);

        // Danh sách các variant dung tích (10ml, 50ml, ...) sắp xếp tăng dần
        List<ProductMilResponse> variants = (p.getProductMils() != null)
                ? p.getProductMils().stream()
                        .sorted(Comparator.comparingInt(ProductMil::getMil))
                        .map(m -> new ProductMilResponse(
                                m.getId(),
                                m.getMil(),
                                m.getPrice(),
                                m.getBasePrice(),
                                m.getStockQuantity(),
                                m.isActive()
                        ))
                        .toList()
                : Collections.emptyList();

        // Tính tổng tồn kho và xác định trạng thái kho hàng
        long totalStock = variants.stream()
                .mapToLong(ProductMilResponse::stockQuantity)
                .sum();
        String stockStatus = totalStock > 10 ? "Còn hàng" : totalStock > 0 ? "Sắp hết" : "Hết hàng";

        // Danh sách đánh giá sản phẩm sắp xếp theo thời gian mới nhất
        List<ReviewResponse> reviews = (p.getReviews() != null)
                ? p.getReviews().stream()
                        .sorted((r1, r2) -> {
                            if (r1.getCreatedAt() == null) return 1;
                            if (r2.getCreatedAt() == null) return -1;
                            return r2.getCreatedAt().compareTo(r1.getCreatedAt());
                        })
                        .map(r -> new ReviewResponse(
                                r.getId(),
                                r.getRating(),
                                r.getComment(),
                                r.getUser() != null
                                        ? (r.getUser().getFullname() != null && !r.getUser().getFullname().isBlank()
                                                ? r.getUser().getFullname()
                                                : r.getUser().getUsername())
                                        : "Khách hàng",
                                r.getCreatedAt()
                        ))
                        .toList()
                : Collections.emptyList();

        return new ProductDetailResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getFactory() != null ? p.getFactory().getName() : null,
                p.getFactory() != null ? p.getFactory().getAddress() : null,
                Math.round(avgRating * 10.0) / 10.0,
                totalSold,
                reviewCount,
                totalStock,
                stockStatus,
                imageUrls,
                variants,
                reviews
        );
    }
}

