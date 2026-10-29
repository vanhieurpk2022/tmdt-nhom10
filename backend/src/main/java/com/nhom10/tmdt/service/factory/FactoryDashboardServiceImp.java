package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.dto.factory.*;
import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;


import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FactoryDashboardServiceImp implements FactoryDashboardService {
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final RefundRepository refundRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMilRepository productMilRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductCustomRepository productCustomRepository;
    private final ProductCustomItemRepository productCustomItemRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DashboardOverviewResponse getOverview(String email) {
        User user = userRepository.findByEmail(email).orElseThrow( () -> new AppException(ErrorCode.NOT_FOUND));
        Long factoryId = user.getFactory().getId();
        LocalDateTime from = LocalDateTime.now()
                .minusDays(30);

        // =========================
        // SUMMARY
        // =========================

        int newOrders = (int) orderRepository
                .countByFactoryIdAndStatus(
                        factoryId,
                        OrderStatus.PENDING
                );

        List<Object[]> deliveryStats =
                orderRepository.countDeliveryStats(factoryId, from);

        long deliveredOrders = 0;
        long onTimeOrders = 0;

        if (!deliveryStats.isEmpty()) {
            Object[] row = deliveryStats.get(0);

            deliveredOrders = row[0] != null
                    ? ((Number) row[0]).longValue()
                    : 0;

            onTimeOrders = row[1] != null
                    ? ((Number) row[1]).longValue()
                    : 0;
        }

        double onTimeDeliveryRate = deliveredOrders == 0
                ? 0
                : (double) onTimeOrders / deliveredOrders * 100;

        // Review
        Double ratingAverage =
                reviewRepository.findAverageRatingByFactoryId(factoryId);

        long ratingCount =
                reviewRepository.countByFactoryId(factoryId);

        // Dispute
        long openDisputes =
                refundRepository.countOpenByFactoryId(factoryId);


        DashboardOverviewResponse.Summary summary =
                new DashboardOverviewResponse.Summary(
                        newOrders,
                        onTimeDeliveryRate,
                        ratingAverage != null ? ratingAverage : 0,
                        (int) ratingCount,
                        (int) openDisputes
                );


        // =========================
        // CANCELLATION
        // =========================

        long totalOrders =
                orderRepository.countByFactoryId(factoryId, from);

        List<Object[]> cancelledData =
                orderRepository.countCancelledGroupByReason(
                        factoryId,
                        from
                );

        long cancelledOrders = cancelledData.stream()
                .mapToLong(row ->
                        ((Number) row[1]).longValue()
                )
                .sum();

        double cancellationRate = totalOrders == 0
                ? 0
                : (double) cancelledOrders / totalOrders * 100;

        List<DashboardOverviewResponse.ReasonCount> reasons =
                cancelledData.stream()
                        .map(row -> new DashboardOverviewResponse.ReasonCount(
                                (CancelReason) row[0],
                                ((Number) row[1]).longValue()
                        ))
                        .toList();

        // Ví dụ giới hạn tỷ lệ hủy là 10%
        double cancellationLimit = 10.0;

        DashboardOverviewResponse.Cancellation cancellation =
                new DashboardOverviewResponse.Cancellation(
                        cancellationRate,
                        cancellationLimit,
                        reasons
                );


        // =========================
        // REVENUE
        // =========================

        long totalRevenue =
                orderRepository.sumRevenueByFactoryId(
                        factoryId,
                        from
                );

        List<DashboardOverviewResponse.AmountItem> breakdown =
                List.of(
                        new DashboardOverviewResponse.AmountItem(
                                RevenueType.TOTAL,
                                totalRevenue
                        )
                );

        DashboardOverviewResponse.Revenue revenue =
                new DashboardOverviewResponse.Revenue(
                        totalRevenue,
                        breakdown
                );


        // =========================
        // RESPONSE
        // =========================

        return new DashboardOverviewResponse(
                summary,
                cancellation,
                revenue
        );
    }

    @Override
    public List<FactoryOrderDashBoardResponse> factoryGetUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow( () -> new AppException(ErrorCode.NOT_FOUND));

        if (user.getFactory() == null) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        Long factoryId = user.getFactory().getId();
        List<Order> orders = orderRepository.findLatestOrders(
                factoryId,
                PageRequest.of(0, 5)
        );

        List<FactoryOrderDashBoardResponse> res = new ArrayList<>();
        for(Order o : orders) {
            int cnt = o.getOrderItems().size();
            res.add(new FactoryOrderDashBoardResponse(
                    o.getId(),
                    o.getExpectedDeliveryAt().toString(),
                    o.getUser().getFullname(),
                    cnt,
                    o.getTotalPrice(),
                    o.getNote(),
                    o.getStatus()));

        }
        return res;
    }

    @Override
    public List<FactoryChartOrderResponse> getChartOrders(String email, LocalDate from, LocalDate to) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (user.getFactory() == null) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        Long factoryId = user.getFactory().getId();

        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59);

        List<Order> orders = orderRepository.findOrdersByFactoryIdAndDateRange(
                factoryId, fromDateTime, toDateTime);

        List<FactoryChartOrderResponse> res = new ArrayList<>();
        for (Order o : orders) {
            int totalQty = 0;
            if (o.getOrderItems() != null) {
                for (OrderItem it : o.getOrderItems()) {
                    totalQty += it.getQuantity();
                }
            }
            res.add(new FactoryChartOrderResponse(
                    o.getId(),
                    o.getCreatedAt().toString(),
                    totalQty > 0 ? totalQty : 1,
                    o.getTotalPrice(),
                    o.getStatus()));
        }
        return res;
    }

    @Override
    public List<FactoryOrderStatusCount> getOrderStatusCounts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (user.getFactory() == null) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        Long factoryId = user.getFactory().getId();

        List<Object[]> rows = orderRepository.countOrdersGroupByStatus(factoryId);
        List<FactoryOrderStatusCount> res = new ArrayList<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                OrderStatus st = (OrderStatus) r[0];
                long cnt = ((Number) r[1]).longValue();
                res.add(new FactoryOrderStatusCount(st, cnt));
            }
        }
        return res;
    }

    @Override
    public FactoryProductResponse factoryProductRes(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));
        Long factoryId =user.getFactory().getId();
        return new FactoryProductResponse(
                productRepository.getStats(factoryId),
                productRepository.getProducts(factoryId));
    }

    @Override
    public List<FactoryVariantRes> getProductMil(Long productId) {
        List<ProductMil> productMil = productMilRepository.findByProductId(productId);
        List<FactoryVariantRes> variantRes =  new ArrayList<>();
        for(ProductMil p: productMil){
            Product productName = productRepository.findById(productId).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));
            variantRes.add(new FactoryVariantRes(p.getId(),productName.getName(),p.getMil(),p.getPrice(),p.getBasePrice(),p.getStockQuantity(),p.isActive()));
        }
        return variantRes;
    }

    @Override
    @Transactional
    public FactoryProductModalResponse createProduct(FactoryProductModalRequest request, String email) {
            User user = userRepository.findByEmail(email).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));
        Category category = categoryRepository.findById(request.categoryId()).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));

        ProductStatus status = request.status() != null ? request.status() : ProductStatus.ACTIVE;
        ProductType type = request.type() != null ? request.type() : ProductType.NORMAL;

        Product p = Product.builder()
                    .factory(user.getFactory())
                    .name(request.name())
                    .category(category)
                    .productType(type)
                    .status(status)
                    .description(request.description())
                    .build();

        if (type == ProductType.CUSTOM) {
            ProductCustom pc = ProductCustom.builder()
                    .name(request.name())
                    .factory(user.getFactory())
                    .notes(request.description())
                    .price(0.0)
                    .totalVolumeMl(0.0)
                    .bottleType("Tiêu chuẩn")
                    .build();
            ProductCustom savedPc = productCustomRepository.save(pc);
            p.setProductCustom(savedPc);
        }

        Product saved = productRepository.save(p);

        List<String> urls = request.imageUrls() == null
                ? List.of()
                : Arrays.asList(request.imageUrls());

        List<ProductImage> images = urls.stream()
                .map(url -> ProductImage.builder()
                        .product(saved)
                        .imageUrl(url)
                        .build())
                .toList();
        productImageRepository.saveAll(images);

        return FactoryProductModalResponse.builder()
                .name(saved.getName())
                .categoryId(category.getId())
                .type(saved.getProductType())
                .status(saved.getStatus())
                .description(saved.getDescription())
                .imageUrls(request.imageUrls())
                .build();
    }

    @Override
    // imageid
    public void updateThumbnail(Long id, Long productId) {
        List<ProductImage> productImage = productImageRepository.findByProductId(productId);
        productImage.forEach((p)->p.setThumbnail(p.getId().equals(id)));
        productImageRepository.saveAll(productImage);
    }

    @Override
    @Transactional
    public void deleteThumbnail(Long id) {
        ProductImage image = productImageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if(image.isThumbnail()){
            throw new AppException(ErrorCode.CANNOT_DELETE_THUMBNAIL);
        }
        productImageRepository.delete(image);    }

    @Override
    @Transactional
    public void updateFactoryProductMil(Long milId, FactoryVariantRequest request) {
        ProductMil productMil = productMilRepository.findById(milId).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));
        productMil.setBasePrice(request.basePrice());
        productMil.setMil(request.mil());
        productMil.setStockQuantity(request.stockQuantity());
        productMil.setPrice(request.price());
        productMilRepository.save(productMil);
    }

    @Override
    public FactoryProductEditRes getProductEdit(Long productId) {
        Product p = productRepository.findById(productId).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND_PRODUCT));
        String category = categoryRepository.findById(p.getCategory().getId()).orElseThrow(()-> new AppException(ErrorCode.NOT_FOUND_CATEGORY)).getName();

        return new FactoryProductEditRes(p.getId(),p.getName(),category,p.getProductType(),p.getStatus(),p.getDescription());
    }

    @Override
    @Transactional
    public void changeStatusProductMils(Long milId) {
        ProductMil productMil = productMilRepository.findById(milId).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));
        productMil.setActive(!productMil.isActive());
    }

    @Override
    public void updateProductEdit(Long id, FactoryProductEditRequest request) {
        Product p = productRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND_PRODUCT));
        p.setDescription(request.description());
        p.setCategory(p.getCategory());
        p.setName(request.name());
        p.setProductType(request.type());

        if (request.imageUrls() != null && request.imageUrls().length > 0) {
            List<ProductImage> productImages = new ArrayList<>();
            for(String s: request.imageUrls()){
                productImages.add(ProductImage.builder().imageUrl(s).product(p).build());
            }
            productImageRepository.saveAll(productImages);
        }
        productRepository.save(p);
    }

    @Override
    @Transactional
    public void changeStatusProducts(Long id, ChangeStatusProduct req) {
        Product product = productRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND_PRODUCT));
        product.setStatus(req.status());
    }

    @Override
    public void DeleteProduct(Long id) {
        productRepository.delete(productRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.NOT_FOUND_PRODUCT)));
    }

    @Override
    @Transactional
    public FactoryCustomRecipeDto getCustomRecipe(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND_PRODUCT));

        // Nếu sản phẩm CUSTOM chưa có ProductCustom, tự tạo và liên kết
        if (p.getProductType() == ProductType.CUSTOM && p.getProductCustom() == null) {
            ProductCustom pc = ProductCustom.builder()
                    .name(p.getName())
                    .factory(p.getFactory())
                    .notes(p.getDescription())
                    .price(p.getPrice() != null ? p.getPrice() : 0.0)
                    .totalVolumeMl(0.0)
                    .bottleType("Tiêu chuẩn")
                    .build();
            ProductCustom savedPc = productCustomRepository.save(pc);
            p.setProductCustom(savedPc);
            productRepository.save(p);
        }

        ProductCustom pc = p.getProductCustom();
        if (pc == null) {
            return new FactoryCustomRecipeDto(null, null, null, "", List.of());
        }

        List<ProductCustomItem> items = productCustomItemRepository.findByProductCustomId(pc.getId());
        List<FactoryCustomRecipeDto.Item> itemDtos = items.stream().map(item ->
                new FactoryCustomRecipeDto.Item(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProduct() != null ? item.getProduct().getName() : "",
                        item.getPercentage(),
                        item.getVolumeM1(),
                        item.getNote()
                )
        ).toList();

        return new FactoryCustomRecipeDto(pc.getId(), pc.getBottleType(), pc.getLabelDesign(), pc.getNotes(), itemDtos);
    }

    @Override
    @Transactional
    public FactoryCustomRecipeDto saveCustomRecipe(Long productId, FactoryCustomRecipeSaveRequest request) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND_PRODUCT));

        // Đảm bảo ProductCustom tồn tại
        if (p.getProductCustom() == null) {
            ProductCustom pc = ProductCustom.builder()
                    .name(p.getName())
                    .factory(p.getFactory())
                    .notes(request.notes())
                    .price(p.getPrice() != null ? p.getPrice() : 0.0)
                    .totalVolumeMl(0.0)
                    .bottleType("Tiêu chuẩn")
                    .build();
            ProductCustom savedPc = productCustomRepository.save(pc);
            p.setProductCustom(savedPc);
            productRepository.save(p);
        }

        ProductCustom pc = p.getProductCustom();
        if (request.bottleType() != null && !request.bottleType().isBlank()) {
            pc.setBottleType(request.bottleType());
        }
        if (request.labelDesign() != null) {
            pc.setLabelDesign(request.labelDesign());
        }
        pc.setNotes(request.notes());
        productCustomRepository.save(pc);

        // Xóa các items cũ trong product_custom_item
        productCustomItemRepository.deleteByProductCustomId(pc.getId());

        // Tạo các items mới
        List<ProductCustomItem> newItems = new ArrayList<>();
        List<String> scentDetails = new ArrayList<>();

        if (request.items() != null && !request.items().isEmpty()) {
            for (FactoryCustomRecipeSaveRequest.Item it : request.items()) {
                Product scentProduct = productRepository.findById(it.productId())
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND_PRODUCT));

                ProductCustomItem pci = ProductCustomItem.builder()
                        .productCustom(pc)
                        .product(scentProduct)
                        .percentage(it.percentage() != null ? it.percentage() : 0.0)
                        .volumeM1(it.volumeMl() != null ? it.volumeMl() : 0.0)
                        .note(it.note())
                        .build();
                newItems.add(pci);

                int pct = it.percentage() != null ? it.percentage().intValue() : 0;
                String noteSuffix = (it.note() != null && !it.note().isBlank()) ? " (" + it.note() + ")" : "";
                scentDetails.add(pct + "% " + scentProduct.getName() + noteSuffix);
            }
            productCustomItemRepository.saveAll(newItems);
        }

        // Cập nhật description tóm tắt công thức cho Product
        String formulaText = scentDetails.isEmpty() ? "" : "[Công thức phối hương]: " + String.join(" + ", scentDetails);
        String finalDesc = formulaText;
        if (request.notes() != null && !request.notes().isBlank()) {
            finalDesc = formulaText.isEmpty() ? request.notes() : formulaText + "\n" + request.notes();
        }
        p.setDescription(finalDesc);
        productRepository.save(p);

        List<FactoryCustomRecipeDto.Item> itemDtos = newItems.stream().map(item ->
                new FactoryCustomRecipeDto.Item(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getPercentage(),
                        item.getVolumeM1(),
                        item.getNote()
                )
        ).toList();

        return new FactoryCustomRecipeDto(pc.getId(), pc.getBottleType(), pc.getLabelDesign(), pc.getNotes(), itemDtos);
    }

    @Override
    public List<FactoryStaffResponse> getStaffs(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (user.getFactory() == null) {
            throw new AppException(ErrorCode.NOT_FOUND_FACTORY);
        }
        Long factoryId = user.getFactory().getId();
        List<User> users = userRepository.findByFactoryIdOrderByIdDesc(factoryId);
        return users.stream().map(this::toStaffResponse).toList();
    }

    @Override
    public FactoryStaffResponse createStaff(String email, FactoryStaffCreateRequest request) {
        User manager = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Factory factory = manager.getFactory();
        if (factory == null) {
            throw new AppException(ErrorCode.NOT_FOUND_FACTORY);
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        String staffEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsUserByEmail(staffEmail)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Role staffRole = roleRepository.findByName(RoleName.STAFF.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        Role factoryRole = roleRepository.findByName(RoleName.FACTORY.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        User staff = User.builder()
                .fullname(request.getFullname() != null ? request.getFullname().trim() : "")
                .username(staffEmail)
                .email(staffEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .factory(factory)
                .factoryRole(FactoryRole.STAFF)
                .factoryPosition(request.getFactoryPosition() != null && !request.getFactoryPosition().isBlank()
                        ? request.getFactoryPosition().trim()
                        : "Nhân viên bán hàng")
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .isVerify(true)
                .roles(new java.util.HashSet<>(Arrays.asList(staffRole, factoryRole)))
                .storeCredit(0.0)
                .build();

        User saved = userRepository.save(staff);
        return toStaffResponse(saved);
    }

    @Override
    public FactoryStaffResponse updateStaff(String email, Long staffId, FactoryStaffUpdateRequest request) {
        User manager = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Factory factory = manager.getFactory();
        if (factory == null) {
            throw new AppException(ErrorCode.NOT_FOUND_FACTORY);
        }

        User staff = userRepository.findById(staffId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (staff.getFactory() == null || !staff.getFactory().getId().equals(factory.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (request.getFullname() != null) {
            staff.setFullname(request.getFullname().trim());
        }
        if (request.getPhone() != null) {
            staff.setPhone(request.getPhone().trim());
        }
        if (request.getFactoryPosition() != null) {
            staff.setFactoryPosition(request.getFactoryPosition().trim());
        }
        if (request.getStatus() != null) {
            staff.setStatus(request.getStatus());
        }

        User saved = userRepository.save(staff);
        return toStaffResponse(saved);
    }

    @Override
    public void deleteStaff(String email, Long staffId) {
        User manager = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        Factory factory = manager.getFactory();
        if (factory == null) {
            throw new AppException(ErrorCode.NOT_FOUND_FACTORY);
        }

        User staff = userRepository.findById(staffId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (staff.getFactory() == null || !staff.getFactory().getId().equals(factory.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (staff.getFactoryRole() == FactoryRole.OWNER) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        staff.setFactory(null);
        staff.setStatus(UserStatus.INACTIVE);
        userRepository.save(staff);
    }

    private FactoryStaffResponse toStaffResponse(User u) {
        String initials = "";
        if (u.getFullname() != null && !u.getFullname().isBlank()) {
            String[] parts = u.getFullname().trim().split("\\s+");
            if (parts.length == 1) {
                initials = parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
            } else {
                initials = ("" + parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            }
        } else if (u.getEmail() != null && !u.getEmail().isBlank()) {
            initials = u.getEmail().substring(0, Math.min(2, u.getEmail().length())).toUpperCase();
        }

        String position = u.getFactoryPosition();
        if (position == null || position.isBlank()) {
            position = u.getFactoryRole() == FactoryRole.OWNER ? "Quản lý" : "Nhân viên bán hàng";
        }

        return FactoryStaffResponse.builder()
                .id(u.getId())
                .fullname(u.getFullname())
                .email(u.getEmail())
                .phone(u.getPhone())
                .factoryRole(u.getFactoryRole())
                .factoryPosition(position)
                .status(u.getStatus())
                .joinedAt(u.getCreatedAt())
                .avatar(initials)
                .build();
    }
}

