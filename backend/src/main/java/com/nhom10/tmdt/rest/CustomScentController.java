package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.customscent.*;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.service.imp.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/custom-scent")
@RequiredArgsConstructor
public class CustomScentController {

    private final ProductRepository productRepo;
    private final FactoryRepository factoryRepo;
    private final CategoryRepository categoryRepo;
    private final ProductMilRepository productMilRepo;
    private final ProductImageRepository productImageRepo;
    private final ProductCustomRepository productCustomRepo;
    private final ProductCustomItemRepository productCustomItemRepo;
    private final UserRepository userRepo;
    private final CartService cartService;

    /**
     * Lấy danh sách mùi hương tinh dầu có sẵn của một xưởng cụ thể
     * kèm thông tin giá và phân tầng tự nhiên
     */
    @GetMapping("/factories/{factoryId}/scents")
    public ResponseEntity<ApiResponse<List<ScentProductItem>>> getScentsByFactory(@PathVariable Long factoryId) {
        Factory factory = factoryRepo.findById(factoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xưởng: " + factoryId));

        List<Product> products = productRepo.findByFactoryId(factoryId);

        List<ScentProductItem> scents = products.stream()
                .filter(this::isAvailableIngredient)
                .map(p -> new ScentProductItem(
                        p.getId(),
                        p.getName(),
                        p.getDescription(),
                        p.getPrice() != null ? p.getPrice() : 150000.0,
                        factory.getId(),
                        factory.getName(),
                        null))
                .toList();

        return ResponseEntity
                .ok(new ApiResponse<>(200, "Lấy danh sách mùi hương theo xưởng thành công", scents));
    }

    /**
     * Lấy dữ liệu cho trang giới thiệu / showcase:
     * - Top sản phẩm chạy
     * - Sản phẩm người dùng tự tạo có đánh giá nhiều
     */
    @GetMapping("/showcase")
    public ResponseEntity<ApiResponse<CustomScentShowcaseResponse>> getShowcase() {
        List<Product> topSellingProducts = productRepo.findTopCustomProducts(PageRequest.of(0, 8));
        List<Product> userCustomProducts = productRepo.findUserCustomProducts(PageRequest.of(0, 8));

        // Nếu chưa có nhiều sản phẩm custom, lấy thêm từ custom products thông thường
        if (userCustomProducts.isEmpty() && !topSellingProducts.isEmpty()) {
            userCustomProducts = topSellingProducts;
        }

        List<CustomScentShowcaseResponse.CustomScentCardDto> topCards = topSellingProducts.stream()
                .map(this::toCardDto)
                .toList();

        List<CustomScentShowcaseResponse.CustomScentCardDto> userCards = userCustomProducts.stream()
                .map(this::toCardDto)
                .toList();

        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách showcase thành công",
                new CustomScentShowcaseResponse(topCards, userCards)));
    }

    /**
     * Lấy chi tiết công thức và thông tin của 1 sản phẩm custom (để xem hoặc chế tác lại)
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<CustomScentDetailResponse>> getCustomDetail(@PathVariable Long id) {
        Product p = null;
        ProductCustom pc = null;

        // 1. Kiểm tra xem id có phải là Product loại CUSTOM không
        Optional<Product> prodOpt = productRepo.findById(id);
        if (prodOpt.isPresent() && prodOpt.get().getProductType() == ProductType.CUSTOM) {
            p = prodOpt.get();
            pc = p.getProductCustom();
        }

        // 2. Nếu không phải Product CUSTOM, tìm trong bảng product_custom
        if (pc == null) {
            pc = productCustomRepo.findById(id).orElse(null);
            if (pc != null) {
                p = productRepo.findByProductCustomId(pc.getId()).orElse(null);
            }
        }

        // 3. Nếu vẫn không tìm thấy
        if (pc == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy công thức phối hương cho ID: " + id);
        }

        Long factoryId = null;
        String factoryName = "";
        if (pc.getFactory() != null) {
            factoryId = pc.getFactory().getId();
            factoryName = pc.getFactory().getName();
        } else if (p != null && p.getFactory() != null) {
            factoryId = p.getFactory().getId();
            factoryName = p.getFactory().getName();
        } else if (pc.getItems() != null && !pc.getItems().isEmpty() && pc.getItems().get(0).getProduct() != null && pc.getItems().get(0).getProduct().getFactory() != null) {
            factoryId = pc.getItems().get(0).getProduct().getFactory().getId();
            factoryName = pc.getItems().get(0).getProduct().getFactory().getName();
        }

        String creatorName = "Khách hàng Oilia";
        if (pc.getUser() != null) {
            creatorName = pc.getUser().getFullname() != null && !pc.getUser().getFullname().isBlank()
                    ? pc.getUser().getFullname()
                    : pc.getUser().getUsername();
        }

        List<CustomScentDetailResponse.CustomScentDetailItemDto> itemDtos = new ArrayList<>();
        if (pc.getItems() != null) {
            for (var item : pc.getItems()) {
                if (item.getProduct() != null) {
                    itemDtos.add(new CustomScentDetailResponse.CustomScentDetailItemDto(
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getVolumeM1(),
                            item.getPercentage(),
                            item.getProduct().getPrice() != null ? item.getProduct().getPrice() : 150000.0
                    ));
                }
            }
        }

        CustomScentDetailResponse responseData = new CustomScentDetailResponse(
                pc.getId(),
                p != null ? p.getId() : null,
                pc.getName() != null && !pc.getName().isBlank() ? pc.getName() : (p != null ? p.getName() : "Hương tùy chỉnh"),
                factoryId,
                factoryName,
                pc.getBottleType(),
                pc.getLabelDesign(),
                pc.getTotalVolumeMl() != null ? pc.getTotalVolumeMl() : 30.0,
                pc.getPrice() > 0 ? pc.getPrice() : (p != null && p.getPrice() != null ? p.getPrice() : 150000.0),
                pc.getNotes(),
                creatorName,
                itemDtos
        );

        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy chi tiết công thức thành công", responseData));
    }

    /**
     * Tạo sản phẩm phối hương độc bản Product & ProductCustom
     * Lưu ý theo wireframe: lưu xuống product_custom và product_custom_item ghi tên userId vào (ko gắn factory id)
     */
    @PostMapping("/create")
    @Transactional
    public ResponseEntity<ApiResponse<CustomScentOrderResponse>> createCustomProduct(
            @Valid @RequestBody CreateCustomScentRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện");
        }
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));
        Factory factory = factoryRepo.findById(req.factoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xưởng sản xuất: " + req.factoryId()));

        // Kiểm tra đầy đủ công thức trước khi ghi bất kỳ dữ liệu nào.
        List<Product> ingredients = new ArrayList<>();
        double totalPercentage = 0;
        for (var item : req.items()) {
            Product ingredient = productRepo.findById(item.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy nguyên liệu"));
            if (!isAvailableIngredient(ingredient)
                    || ingredient.getFactory() == null
                    || !factory.getId().equals(ingredient.getFactory().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nguyên liệu phải đang hoạt động và thuộc xưởng đã chọn");
            }
            double expectedVolume = req.totalVolumeMl() * item.percentage() / 100;
            if (!Double.isFinite(item.percentage()) || !Double.isFinite(item.volumeMl())
                    || Math.abs(item.volumeMl() - expectedVolume) > 0.1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dung tích thành phần không khớp tỷ lệ phối hương");
            }
            totalPercentage += item.percentage();
            ingredients.add(ingredient);
        }
        if (Math.abs(totalPercentage - 100) > 0.5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tổng tỷ lệ phối hương phải bằng 100%");
        }

        Category category = categoryRepo.findByName("Tinh dầu phối");
        if (category == null) {
            category = categoryRepo.findAll().stream().findFirst().orElse(null);
        }

        String customName = (req.name() != null && !req.name().isBlank())
                ? req.name().trim()
                : (req.customNote() != null && !req.customNote().isBlank()
                        ? "Bespoke: " + req.customNote().trim()
                        : "Hương độc bản Oilia");

        // 1. Lưu thông tin chung của công thức vào product_custom (User prompt: ghi userId, KO GẮN factory id).
        ProductCustom pc = ProductCustom.builder()
                .name(customName)
                .notes(req.customNote())
                .user(user)
                .factory(null) // Ko gắn factory_id vào product_custom theo yêu cầu bản thảo
                .bottleType(req.bottleType())
                .labelDesign(req.labelDesign())
                .totalVolumeMl(req.totalVolumeMl())
                .price(req.price())
                .build();
        ProductCustom savedPc = productCustomRepo.save(pc);

        // 2. Tạo các thành phần tầng hương ProductCustomItem và thu thập tên mùi
        List<String> scentDetails = new ArrayList<>();
        List<ProductCustomItem> customItems = new ArrayList<>();
        for (int i = 0; i < req.items().size(); i++) {
            var itemReq = req.items().get(i);
            Product scentProduct = ingredients.get(i);
            customItems.add(ProductCustomItem.builder()
                    .productCustom(savedPc)
                    .product(scentProduct)
                    .percentage(itemReq.percentage())
                    .volumeM1(req.totalVolumeMl() * itemReq.percentage() / 100)
                    .build());

            String cleanScentName = scentProduct.getName().replace("Tinh dầu ", "").replace("Tinh Dầu ", "");
            scentDetails.add(cleanScentName + " (" + Math.round(itemReq.percentage()) + "%)");
        }
        productCustomItemRepo.saveAll(customItems);
        savedPc.setItems(customItems);

        // 3. Tạo Product CUSTOM cho toàn bộ công thức, liên kết qua product_custom_id & factory phục vụ chế tác.
        String scentFormula = scentDetails.isEmpty() ? "Hòa hương độc bản" : String.join(" + ", scentDetails);
        String customDesc = String.format("Công thức mùi: %s | Mẫu lọ: %s | Xưởng: %s",
                scentFormula, req.bottleType(), factory.getName());

        Product product = Product.builder()
                .name(customName)
                .description(customDesc)
                .price(req.price())
                .minBasePrice(req.price())
                .productType(ProductType.CUSTOM)
                .productCustom(savedPc)
                .factory(factory)
                .category(category)
                .status(ProductStatus.ACTIVE)
                .totalSold(0L)
                .views(0L)
                .build();
        Product savedProduct = productRepo.save(product);

        // 4. Tạo ProductMil đại diện cho dung tích đã chọn
        ProductMil mil = ProductMil.builder()
                .product(savedProduct)
                .mil(req.totalVolumeMl().intValue())
                .price(req.price())
                .basePrice(req.price())
                .stockQuantity(999)
                .isActive(true)
                .build();
        ProductMil savedMil = productMilRepo.saveAndFlush(mil);

        List<ProductMil> mils = new ArrayList<>();
        mils.add(savedMil);
        savedProduct.setProductMils(mils);

        // 5. Thêm ảnh thumbnail cho sản phẩm phối hương
        String thumbnailImg = (req.labelDesign() != null && !req.labelDesign().isBlank())
                ? req.labelDesign().trim()
                : "/images/home/relax-gift-box.png";
        ProductImage img = ProductImage.builder()
                .product(savedProduct)
                .imageUrl(thumbnailImg)
                .isThumbnail(true)
                .build();
        productImageRepo.saveAndFlush(img);

        CustomScentOrderResponse responseData = new CustomScentOrderResponse(
                savedProduct.getId(),
                savedMil.getId(),
                savedPc.getId(),
                savedProduct.getName(),
                savedProduct.getPrice(),
                req.quantity() != null && req.quantity() > 0 ? req.quantity() : 1
        );

        return ResponseEntity.ok(new ApiResponse<>(200, "Tạo đơn công thức phối hương thành công", responseData));
    }

    /**
     * Thêm sản phẩm phối hương vào giỏ hàng của người dùng hiện tại
     */
    @PostMapping("/add-to-cart")
    @Transactional
    public ResponseEntity<ApiResponse<CartResponse>> addCustomScentToCart(
            @Valid @RequestBody CreateCustomScentRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(401, "Vui lòng đăng nhập để thực hiện", null));
        }

        // Tạo custom product trước
        ResponseEntity<ApiResponse<CustomScentOrderResponse>> created = createCustomProduct(req, userDetails);
        CustomScentOrderResponse data = created.getBody().getData();

        // Thêm vào giỏ hàng
        com.nhom10.tmdt.dto.cart.AddCartItemRequest cartReq = new com.nhom10.tmdt.dto.cart.AddCartItemRequest(
                data.productId(),
                data.quantity(),
                data.productMilId()
        );
        CartResponse cartRes = cartService.addItem(userDetails.getUsername(), cartReq);

        return ResponseEntity.ok(new ApiResponse<>(200, "Đã thêm tinh dầu phối hương vào giỏ hàng!", cartRes));
    }

    @GetMapping("/bottle-samples")
    public ResponseEntity<ApiResponse<List<com.nhom10.tmdt.dto.factory.CustomBottleSampleResponse>>> getBottleSamples() {
        List<ProductImage> sampleImages = productImageRepo.findByIsCustomExampleTrue();
        if (sampleImages.isEmpty()) {
            sampleImages = productImageRepo.findByIsCustomSampleTrue();
        }
        List<com.nhom10.tmdt.dto.factory.CustomBottleSampleResponse> samples = sampleImages.stream()
                .map(img -> com.nhom10.tmdt.dto.factory.CustomBottleSampleResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isCustomSample(img.isCustomSample() || img.isCustomExample())
                        .isThumbnail(img.isThumbnail())
                        .productId(img.getProduct() != null ? img.getProduct().getId() : null)
                        .productName(img.getProduct() != null ? img.getProduct().getName() : null)
                        .uploadedAt(img.getUploadedAt())
                        .build())
                .toList();
        return ResponseEntity.ok(new ApiResponse<>(200, "Lấy danh sách chai mẫu gợi ý thành công", samples));
    }

    private boolean isAvailableIngredient(Product product) {
        return product.getProductType() == ProductType.NORMAL
                && (product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE);
    }

    private CustomScentShowcaseResponse.CustomScentCardDto toCardDto(Product p) {
        ProductCustom pc = p.getProductCustom();

        String ingredientsText = "";
        if (pc != null && pc.getItems() != null && !pc.getItems().isEmpty()) {
            ingredientsText = pc.getItems().stream()
                    .filter(it -> it.getProduct() != null)
                    .map(it -> it.getProduct().getName())
                    .collect(Collectors.joining(", "));
        } else if (p.getDescription() != null && p.getDescription().contains("Công thức mùi: ")) {
            int start = p.getDescription().indexOf("Công thức mùi: ") + 15;
            int end = p.getDescription().indexOf(" |", start);
            ingredientsText = end > start ? p.getDescription().substring(start, end) : p.getDescription().substring(start);
        } else {
            ingredientsText = "Hòa quyện nhiều nốt hương độc bản";
        }

        String creatorName = "Nghệ nhân Oilia";
        if (pc != null && pc.getUser() != null) {
            creatorName = pc.getUser().getFullname() != null && !pc.getUser().getFullname().isBlank()
                    ? pc.getUser().getFullname()
                    : pc.getUser().getUsername();
        }

        String imageUrl = "/images/home/relax-gift-box.png";
        if (pc != null && pc.getLabelDesign() != null && !pc.getLabelDesign().isBlank()) {
            imageUrl = pc.getLabelDesign();
        } else if (p.getProductImages() != null && !p.getProductImages().isEmpty()) {
            imageUrl = p.getProductImages().stream()
                    .filter(ProductImage::isThumbnail)
                    .findFirst()
                    .map(ProductImage::getImageUrl)
                    .orElse(p.getProductImages().get(0).getImageUrl());
        }

        double priceVal = pc != null && pc.getPrice() > 0 ? pc.getPrice() : (p.getPrice() != null ? p.getPrice() : 150000.0);
        long reviewCount = p.getReviews() != null ? (long) p.getReviews().size() : 0L;
        double avgRating = 5.0;
        if (p.getReviews() != null && !p.getReviews().isEmpty()) {
            avgRating = p.getReviews().stream().mapToInt(Review::getRating).average().orElse(5.0);
        }

        return new CustomScentShowcaseResponse.CustomScentCardDto(
                p.getId(),
                pc != null ? pc.getId() : null,
                p.getName() != null ? p.getName() : "Thiên nhiên gỗ",
                ingredientsText,
                p.getFactory() != null ? p.getFactory().getId() : null,
                p.getFactory() != null ? p.getFactory().getName() : "Oilia Atelier",
                creatorName,
                priceVal,
                imageUrl,
                p.getTotalSold() != null ? p.getTotalSold() : 0L,
                reviewCount,
                avgRating
        );
    }
}
