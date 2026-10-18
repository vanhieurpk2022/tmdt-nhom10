package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.dto.factory.*;
import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.RevenueType;
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
}
