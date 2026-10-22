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
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody CreateCustomScentRequest req
    ) {
        Factory factory = factoryRepo.findById(req.factoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xưởng sản xuất: " + req.factoryId()));

        Category category = categoryRepo.findByName("Tinh dầu phối");
        if (category == null) {
            category = categoryRepo.findAll().stream().findFirst().orElse(null);
        }

        // 1. Tạo ProductCustom
        ProductCustom pc = ProductCustom.builder()
                .factory(factory)
                .bottleType(req.bottleType())
                .labelDesign(req.labelDesign())
                .totalVolumeMl(req.totalVolumeMl())
                .price(req.price())
                .build();
        ProductCustom savedPc = productCustomRepo.save(pc);

        // 2. Tạo các thành phần tầng hương ProductCustomItem
        if (req.items() != null && !req.items().isEmpty()) {
            for (var itemReq : req.items()) {
                Product scentProduct = productRepo.findById(itemReq.productId()).orElse(null);
                if (scentProduct != null) {
                    ProductCustomItem pci = ProductCustomItem.builder()
                            .productCustom(savedPc)
                            .product(scentProduct)
                            .percentage(itemReq.percentage() != null ? itemReq.percentage() : 0.0)
                            .volumeM1(itemReq.volumeMl() != null ? itemReq.volumeMl() : 0.0)
                            .build();
                    productCustomItemRepo.save(pci);
                }
            }
        }

        // 3. Tạo Product đại diện để tích hợp giỏ hàng và đặt hàng
        String customName = "Bespoke: " + (req.customNote() != null && !req.customNote().isBlank() ? req.customNote().trim() : "Hương độc bản Oilia");
        String customDesc = String.format("Tinh dầu phối hương theo yêu cầu riêng (%dml) - Mẫu lọ: %s. Xưởng gia công: %s.",
                req.totalVolumeMl().intValue(), req.bottleType(), factory.getName());

        Product product = Product.builder()
                .name(customName)
                .description(customDesc)
                .price(req.price())
                .minBasePrice(req.price())
                .productType(ProductType.CUSTOM)
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
        productRepo.saveAndFlush(savedProduct);

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
            @RequestBody CreateCustomScentRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(401, "Vui lòng đăng nhập để thực hiện", null));
        }

        // Tạo custom product trước
        ResponseEntity<ApiResponse<CustomScentOrderResponse>> created = createCustomProduct(req);
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
}
