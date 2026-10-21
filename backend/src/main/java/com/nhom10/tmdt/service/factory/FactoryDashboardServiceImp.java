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

        Product p = Product.builder()
                    .factory(user.getFactory())
                    .name(request.name())
                    .category(category)
                    .productType(request.type())
                    .status(request.status())
                    .description(request.description())
                    .build();
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

        List<ProductImage > productImages = new ArrayList<>();
        for(String s: request.imageUrls()){
            productImages.add(ProductImage.builder().imageUrl(s).product(p).build());
        }
        productImageRepository.saveAll(productImages);
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
}
