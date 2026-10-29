package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.customscent.CreateCustomScentRequest;
import com.nhom10.tmdt.dto.customscent.CustomScentOrderResponse;
import com.nhom10.tmdt.dto.customscent.ScentProductItem;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.service.imp.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

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
     * Tạo sản phẩm phối hương độc bản Product & ProductCustom
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
                    || Math.abs(item.volumeMl() - expectedVolume) > 0.000001) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dung tích thành phần không khớp tỷ lệ phối hương");
            }
            totalPercentage += item.percentage();
            ingredients.add(ingredient);
        }
        if (Math.abs(totalPercentage - 100) > 0.000001) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tổng tỷ lệ phối hương phải bằng 100%");
        }

        Category category = categoryRepo.findByName("Tinh dầu phối");
        if (category == null) {
            category = categoryRepo.findAll().stream().findFirst().orElse(null);
        }

        String customName = "Bespoke: " + (req.customNote() != null && !req.customNote().isBlank() ? req.customNote().trim() : "Hương độc bản Oilia");

        // 1. Lưu thông tin chung của công thức vào product_custom.
        ProductCustom pc = ProductCustom.builder()
                .name(customName)
                .notes(req.customNote())
                .user(user)
                .factory(factory)
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
            scentDetails.add(cleanScentName + " (" + itemReq.percentage() + "%)");
        }
        productCustomItemRepo.saveAll(customItems);
        savedPc.setItems(customItems);

        // 3. Chỉ tạo một Product CUSTOM cho toàn bộ công thức, liên kết qua product_custom_id.
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
                .stockQuantity(999) // Hương theo yêu cầu luôn có sẵn mẻ pha
                .isActive(true)
                .build();
        ProductMil savedMil = productMilRepo.saveAndFlush(mil);

        // Đảm bảo list productMils của product trong session chứa mil này
        List<ProductMil> mils = new ArrayList<>();
        mils.add(savedMil);
        savedProduct.setProductMils(mils);

        // 5. Thêm ảnh thumbnail mặc định cho sản phẩm phối hương
        ProductImage img = ProductImage.builder()
                .product(savedProduct)
                .imageUrl("/images/home/relax-gift-box.png")
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

    private boolean isAvailableIngredient(Product product) {
        // Dữ liệu V2 cũ chưa có status; vẫn cho phép dùng các nguyên liệu này.
        return product.getProductType() == ProductType.NORMAL
                && (product.getStatus() == null || product.getStatus() == ProductStatus.ACTIVE);
    }
}
