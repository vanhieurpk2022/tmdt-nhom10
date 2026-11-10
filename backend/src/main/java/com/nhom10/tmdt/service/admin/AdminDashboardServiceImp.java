package com.nhom10.tmdt.service.admin;
import com.nhom10.tmdt.dto.admin.dashboard.*;
import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.OrderItem;
import com.nhom10.tmdt.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, readOnly = true)
public class AdminDashboardServiceImp implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final FactoryRepository factoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final RefundRepository refundRepository;

    private static final String[] PALETTE = {
            "#e11d48", "#3b82f6", "#10b981", "#f59e0b",
            "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
            "#f97316", "#64748b"
    };

    @Override
    public AdminDashboardOverviewDto getOverviewStats() {
        Double totalRevenue = orderRepository.sumTotalRevenue();
        double validTotalRev = totalRevenue != null ? totalRevenue : 0.0;

        Double deliveredRevenue = orderRepository.sumDeliveredRevenue();
        double validDeliveredRev = deliveredRevenue != null ? deliveredRevenue : 0.0;

        double pendingSettlement = Math.max(0.0, validTotalRev - validDeliveredRev);

        long totalOrders = orderRepository.count();
        long pendingPayment = orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT);
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmed = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long processing = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shipped = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long delivering = orderRepository.countByStatus(OrderStatus.DELIVERING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);

        long pendingOrders = pendingPayment + pending;
        long processingOrders = confirmed + processing;
        long shippingOrders = shipped + delivering;

        double deliverySuccessRate = totalOrders == 0 ? 0.0 :
                Math.round(((double) delivered / totalOrders * 100.0) * 10.0) / 10.0;
        double cancellationRate = totalOrders == 0 ? 0.0 :
                Math.round(((double) cancelled / totalOrders * 100.0) * 10.0) / 10.0;

        long activeWorkshops = factoryRepository.countByFactoryStatus(FactoryStatus.ACTIVE);
        long pendingWorkshops = factoryRepository.countByFactoryStatus(FactoryStatus.PENDING);
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();

        Double avgRating = reviewRepository.findPlatformAverageRating();
        double validAvgRating = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 4.9;
        long totalReviews = reviewRepository.count();
        long openDisputes = refundRepository.countOpenPlatformRefunds();

        return AdminDashboardOverviewDto.builder()
                .totalRevenue(validTotalRev)
                .settledRevenue(validDeliveredRev)
                .pendingSettlementRevenue(pendingSettlement)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .processingOrders(processingOrders)
                .shippingOrders(shippingOrders)
                .deliveredOrders(delivered)
                .cancelledOrders(cancelled)
                .deliverySuccessRate(deliverySuccessRate)
                .cancellationRate(cancellationRate)
                .activeWorkshops(activeWorkshops)
                .pendingWorkshops(pendingWorkshops)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .averageRating(validAvgRating)
                .totalReviews(totalReviews)
                .openDisputes(openDisputes)
                .build();
    }

    @Override
    public AdminBarChartResponseDto getBarChartStats(LocalDate from, LocalDate to, String period, String groupBy) {
        LocalDate today = LocalDate.now();

        if (period != null && !period.isBlank()) {
            switch (period.toLowerCase()) {
                case "7days" -> {
                    from = today.minusDays(6);
                    to = today;
                    if (groupBy == null || groupBy.isBlank()) groupBy = "DAY";
                }
                case "30days" -> {
                    from = today.minusDays(29);
                    to = today;
                    if (groupBy == null || groupBy.isBlank()) groupBy = "DAY";
                }
                case "90days" -> {
                    from = today.minusDays(89);
                    to = today;
                    if (groupBy == null || groupBy.isBlank()) groupBy = "DAY";
                }
                case "year" -> {
                    from = today.minusMonths(11).withDayOfMonth(1);
                    to = today;
                    if (groupBy == null || groupBy.isBlank()) groupBy = "MONTH";
                }
                case "all" -> {
                    from = today.minusYears(2).withDayOfMonth(1);
                    to = today;
                    if (groupBy == null || groupBy.isBlank()) groupBy = "MONTH";
                }
                default -> {}
            }
        }

        if (from == null) from = today.minusDays(29);
        if (to == null) to = today;
        if (from.isAfter(to)) {
            LocalDate tmp = from;
            from = to;
            to = tmp;
        }

        // 2. Xác định cách gom nhóm
        long daysDiff = ChronoUnit.DAYS.between(from, to);
        boolean isMonthGrouping = "MONTH".equalsIgnoreCase(groupBy) ||
                (groupBy == null && daysDiff > 62);

        String effectiveGroupBy = isMonthGrouping ? "MONTH" : "DAY";

        // 3. Khởi tạo sẵn tất cả các mốc thời gian liên tục với giá trị 0
        Map<String, AdminBarChartItemDto> bucketMap = new LinkedHashMap<>();

        if (isMonthGrouping) {
            YearMonth startMonth = YearMonth.from(from);
            YearMonth endMonth = YearMonth.from(to);
            DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM");
            DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("MM/yyyy");

            YearMonth cur = startMonth;
            while (!cur.isAfter(endMonth)) {
                String key = cur.format(keyFmt);
                String label = cur.format(labelFmt);
                bucketMap.put(key, AdminBarChartItemDto.builder()
                        .date(key)
                        .label(label)
                        .revenue(0.0)
                        .orderCount(0L)
                        .totalQuantity(0L)
                        .completedOrders(0L)
                        .cancelledOrders(0L)
                        .customRevenue(0.0)
                        .normalRevenue(0.0)
                        .build());
                cur = cur.plusMonths(1);
            }
        } else {
            DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd/MM");

            LocalDate cur = from;
            while (!cur.isAfter(to)) {
                String key = cur.format(keyFmt);
                String label = cur.format(labelFmt);
                bucketMap.put(key, AdminBarChartItemDto.builder()
                        .date(key)
                        .label(label)
                        .revenue(0.0)
                        .orderCount(0L)
                        .totalQuantity(0L)
                        .completedOrders(0L)
                        .cancelledOrders(0L)
                        .customRevenue(0.0)
                        .normalRevenue(0.0)
                        .build());
                cur = cur.plusDays(1);
            }
        }

        // 4. Lấy đơn hàng trong khoảng và phân bổ vào các mốc thời gian
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findAllOrdersInDateRange(fromDateTime, toDateTime);

        DateTimeFormatter matchFmt = isMonthGrouping
                ? DateTimeFormatter.ofPattern("yyyy-MM")
                : DateTimeFormatter.ofPattern("yyyy-MM-dd");

        double totalPeriodRev = 0.0;
        long totalPeriodOrd = 0L;
        long totalPeriodQty = 0L;

        for (Order o : orders) {
            if (o.getCreatedAt() == null) continue;
            String key = o.getCreatedAt().format(matchFmt);
            AdminBarChartItemDto item = bucketMap.get(key);
            if (item == null) continue;

            totalPeriodOrd++;
            item.setOrderCount(item.getOrderCount() + 1);

            if (o.getStatus() == OrderStatus.DELIVERED) {
                item.setCompletedOrders(item.getCompletedOrders() + 1);
            } else if (o.getStatus() == OrderStatus.CANCELLED) {
                item.setCancelledOrders(item.getCancelledOrders() + 1);
            }

            // Doanh thu tính cho các đơn không bị hủy
            if (o.getStatus() != OrderStatus.CANCELLED) {
                double orderTotal = o.getTotalPrice() != null ? o.getTotalPrice() : 0.0;
                item.setRevenue(item.getRevenue() + orderTotal);
                totalPeriodRev += orderTotal;

                if (o.getOrderItems() != null) {
                    for (OrderItem oi : o.getOrderItems()) {
                        long qty = oi.getQuantity();
                        item.setTotalQuantity(item.getTotalQuantity() + qty);
                        totalPeriodQty += qty;

                        double lineAmount = qty * oi.getUnitPrice();
                        if (oi.getProduct() != null && oi.getProduct().getProductType() == ProductType.CUSTOM) {
                            item.setCustomRevenue(item.getCustomRevenue() + lineAmount);
                        } else {
                            item.setNormalRevenue(item.getNormalRevenue() + lineAmount);
                        }
                    }
                }
            }
        }

        return AdminBarChartResponseDto.builder()
                .fromDate(from)
                .toDate(to)
                .groupBy(effectiveGroupBy)
                .totalPeriodRevenue(totalPeriodRev)
                .totalPeriodOrders(totalPeriodOrd)
                .totalPeriodQuantity(totalPeriodQty)
                .items(new ArrayList<>(bucketMap.values()))
                .build();
    }

    @Override
    public AdminPieChartDataDto getPieChartStats() {
        return AdminPieChartDataDto.builder()
                .orderStatusDistribution(buildOrderStatusDistribution())
                .categoryDistribution(buildCategoryDistribution())
                .productTypeDistribution(buildProductTypeDistribution())
                .cancelReasonDistribution(buildCancelReasonDistribution())
                .paymentMethodDistribution(buildPaymentMethodDistribution())
                .topWorkshopsDistribution(buildTopWorkshopsDistribution())
                .build();
    }

    @Override
    public AdminDashboardFullResponseDto getFullDashboard(LocalDate from, LocalDate to, String period, String groupBy) {
        return AdminDashboardFullResponseDto.builder()
                .overview(getOverviewStats())
                .barChart(getBarChartStats(from, to, period, groupBy))
                .pieCharts(getPieChartStats())
                .build();
    }



    private List<AdminPieSliceDto> buildOrderStatusDistribution() {
        List<Object[]> rows = orderRepository.countAllOrdersGroupByStatus();
        long totalOrders = 0;
        Map<OrderStatus, Long> map = new EnumMap<>(OrderStatus.class);

        for (Object[] r : rows) {
            if (r[0] != null) {
                OrderStatus st = (OrderStatus) r[0];
                long cnt = ((Number) r[1]).longValue();
                map.put(st, cnt);
                totalOrders += cnt;
            }
        }

        List<AdminPieSliceDto> slices = new ArrayList<>();
        for (OrderStatus st : OrderStatus.values()) {
            long count = map.getOrDefault(st, 0L);
            double pct = totalOrders > 0 ? Math.round(((double) count / totalOrders * 100.0) * 10.0) / 10.0 : 0.0;
            slices.add(AdminPieSliceDto.builder()
                    .key(st.name())
                    .label(getOrderStatusLabel(st))
                    .count(count)
                    .percentage(pct)
                    .color(getOrderStatusColor(st))
                    .build());
        }

        slices.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        return slices;
    }

    private List<AdminPieSliceDto> buildCategoryDistribution() {
        List<Object[]> rows = orderRepository.findRevenueGroupByCategory();
        double totalRevenue = 0.0;
        for (Object[] r : rows) {
            totalRevenue += ((Number) r[2]).doubleValue();
        }

        List<AdminPieSliceDto> slices = new ArrayList<>();
        int colorIdx = 0;
        for (Object[] r : rows) {
            Long catId = (Long) r[0];
            String name = (String) r[1];
            double amount = ((Number) r[2]).doubleValue();
            long count = ((Number) r[3]).longValue(); // Tổng chai bán ra
            double pct = totalRevenue > 0 ? Math.round((amount / totalRevenue * 100.0) * 10.0) / 10.0 : 0.0;

            slices.add(AdminPieSliceDto.builder()
                    .key(String.valueOf(catId))
                    .label(name != null ? name : "Chưa phân loại")
                    .amount(amount)
                    .count(count)
                    .percentage(pct)
                    .color(PALETTE[colorIdx % PALETTE.length])
                    .build());
            colorIdx++;
        }

        if (slices.isEmpty()) {
            slices.add(AdminPieSliceDto.builder()
                    .key("0")
                    .label("Chưa có phát sinh đơn")
                    .amount(0.0)
                    .count(0L)
                    .percentage(100.0)
                    .color("#94a3b8")
                    .build());
        }

        return slices;
    }

    private List<AdminPieSliceDto> buildProductTypeDistribution() {
        List<Object[]> rows = orderRepository.sumRevenueGroupByProductType();
        double totalRev = 0.0;
        long totalOrders = 0;
        Map<ProductType, Double> revMap = new EnumMap<>(ProductType.class);
        Map<ProductType, Long> countMap = new EnumMap<>(ProductType.class);

        for (Object[] r : rows) {
            ProductType type = (ProductType) r[0];
            long count = ((Number) r[1]).longValue();
            double rev = ((Number) r[2]).doubleValue();
            if (type != null) {
                revMap.put(type, rev);
                countMap.put(type, count);
                totalRev += rev;
                totalOrders += count;
            }
        }

        double normalRev = revMap.getOrDefault(ProductType.NORMAL, 0.0);
        long normalCount = countMap.getOrDefault(ProductType.NORMAL, 0L);
        double normalPct = totalRev > 0 ? Math.round((normalRev / totalRev * 100.0) * 10.0) / 10.0 : 50.0;

        double customRev = revMap.getOrDefault(ProductType.CUSTOM, 0.0);
        long customCount = countMap.getOrDefault(ProductType.CUSTOM, 0L);
        double customPct = totalRev > 0 ? Math.round((customRev / totalRev * 100.0) * 10.0) / 10.0 : 50.0;

        return List.of(
                AdminPieSliceDto.builder()
                        .key(ProductType.NORMAL.name())
                        .label("Nước hoa & Tinh dầu Tiêu chuẩn")
                        .count(normalCount)
                        .amount(normalRev)
                        .percentage(normalPct)
                        .color("#3b82f6")
                        .build(),
                AdminPieSliceDto.builder()
                        .key(ProductType.CUSTOM.name())
                        .label("Phối hương Độc bản (Bespoke)")
                        .count(customCount)
                        .amount(customRev)
                        .percentage(customPct)
                        .color("#8b5cf6")
                        .build()
        );
    }

    private List<AdminPieSliceDto> buildCancelReasonDistribution() {
        List<Object[]> rows = orderRepository.countAllCancelledGroupByReason();
        long totalCancelled = 0;
        Map<CancelReason, Long> map = new EnumMap<>(CancelReason.class);

        for (Object[] r : rows) {
            if (r[0] != null) {
                CancelReason reason = (CancelReason) r[0];
                long cnt = ((Number) r[1]).longValue();
                map.put(reason, cnt);
                totalCancelled += cnt;
            }
        }

        List<AdminPieSliceDto> slices = new ArrayList<>();
        for (CancelReason r : CancelReason.values()) {
            long count = map.getOrDefault(r, 0L);
            double pct = totalCancelled > 0 ? Math.round(((double) count / totalCancelled * 100.0) * 10.0) / 10.0 : 0.0;
            slices.add(AdminPieSliceDto.builder()
                    .key(r.name())
                    .label(getCancelReasonLabel(r))
                    .count(count)
                    .percentage(pct)
                    .color(getCancelReasonColor(r))
                    .build());
        }

        slices.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        return slices;
    }

    private List<AdminPieSliceDto> buildPaymentMethodDistribution() {
        List<Object[]> rows = orderRepository.countAllOrdersGroupByPaymentMethod();
        long totalOrders = 0;
        for (Object[] r : rows) {
            totalOrders += ((Number) r[1]).longValue();
        }

        List<AdminPieSliceDto> slices = new ArrayList<>();
        for (Object[] r : rows) {
            PaymentMethod method = (PaymentMethod) r[0];
            long count = ((Number) r[1]).longValue();
            double amount = ((Number) r[2]).doubleValue();
            double pct = totalOrders > 0 ? Math.round(((double) count / totalOrders * 100.0) * 10.0) / 10.0 : 0.0;

            String label = method == PaymentMethod.VNPAY ? "Ví điện tử / Cổng VNPAY" : "Thanh toán khi nhận hàng (COD)";
            String color = method == PaymentMethod.VNPAY ? "#0284c7" : "#10b981";

            slices.add(AdminPieSliceDto.builder()
                    .key(method != null ? method.name() : "OTHER")
                    .label(label)
                    .count(count)
                    .amount(amount)
                    .percentage(pct)
                    .color(color)
                    .build());
        }

        if (slices.isEmpty()) {
            slices.add(AdminPieSliceDto.builder()
                    .key("COD")
                    .label("Thanh toán khi nhận hàng (COD)")
                    .count(0L)
                    .amount(0.0)
                    .percentage(50.0)
                    .color("#10b981")
                    .build());
            slices.add(AdminPieSliceDto.builder()
                    .key("VNPAY")
                    .label("Ví điện tử / Cổng VNPAY")
                    .count(0L)
                    .amount(0.0)
                    .percentage(50.0)
                    .color("#0284c7")
                    .build());
        }

        return slices;
    }

    private List<AdminPieSliceDto> buildTopWorkshopsDistribution() {
        List<Object[]> rows = orderRepository.findRevenueGroupByFactory();
        double totalRev = 0.0;
        for (Object[] r : rows) {
            totalRev += ((Number) r[2]).doubleValue();
        }

        List<AdminPieSliceDto> slices = new ArrayList<>();
        int colorIdx = 0;
        double otherRev = 0.0;
        long otherCount = 0L;

        for (int i = 0; i < rows.size(); i++) {
            Object[] r = rows.get(i);
            Long fId = (Long) r[0];
            String name = (String) r[1];
            double amount = ((Number) r[2]).doubleValue();
            long count = ((Number) r[3]).longValue();

            if (i < 4) {
                double pct = totalRev > 0 ? Math.round((amount / totalRev * 100.0) * 10.0) / 10.0 : 0.0;
                slices.add(AdminPieSliceDto.builder()
                        .key(String.valueOf(fId))
                        .label(name != null ? name : "Xưởng #" + fId)
                        .amount(amount)
                        .count(count)
                        .percentage(pct)
                        .color(PALETTE[colorIdx % PALETTE.length])
                        .build());
                colorIdx++;
            } else {
                otherRev += amount;
                otherCount += count;
            }
        }

        if (otherRev > 0 || otherCount > 0) {
            double pct = totalRev > 0 ? Math.round((otherRev / totalRev * 100.0) * 10.0) / 10.0 : 0.0;
            slices.add(AdminPieSliceDto.builder()
                    .key("OTHER")
                    .label("Các xưởng đối tác khác")
                    .amount(otherRev)
                    .count(otherCount)
                    .percentage(pct)
                    .color("#64748b")
                    .build());
        }

        if (slices.isEmpty()) {
            slices.add(AdminPieSliceDto.builder()
                    .key("0")
                    .label("Chưa có doanh thu xưởng phát sinh")
                    .amount(0.0)
                    .count(0L)
                    .percentage(100.0)
                    .color("#94a3b8")
                    .build());
        }

        return slices;
    }

    private String getOrderStatusLabel(OrderStatus st) {
        return switch (st) {
            case PENDING_PAYMENT -> "Chờ thanh toán";
            case PENDING -> "Chờ xác nhận";
            case CONFIRMED -> "Đã xác nhận";
            case PROCESSING -> "Đang gia công / Đóng gói";
            case SHIPPED -> "Đã giao cho vận chuyển";
            case DELIVERING -> "Đang giao hàng";
            case DELIVERED -> "Giao thành công";
            case CANCELLED -> "Đã hủy";
            case RETURNED -> "Đã hoàn trả";
            case REFUNDED -> "Đã hoàn tiền";
        };
    }

    private String getOrderStatusColor(OrderStatus st) {
        return switch (st) {
            case PENDING_PAYMENT -> "#94a3b8"; 
            case PENDING -> "#f59e0b";        
            case CONFIRMED -> "#06b6d4";     
            case PROCESSING -> "#8b5cf6";     
            case SHIPPED -> "#3b82f6";      
            case DELIVERING -> "#0284c7";     
            case DELIVERED -> "#10b981";      
            case CANCELLED -> "#ef4444";     
            case RETURNED -> "#f97316";      
            case REFUNDED -> "#64748b";      
        };
    }

    private String getCancelReasonLabel(CancelReason r) {
        return switch (r) {
            case CUSTOMER_CHANGED_MIND -> "Khách đổi ý / Thay đổi mùi hương";
            case OUT_OF_STOCK -> "Hết nguyên liệu / Tinh dầu gốc";
            case DELIVERY_TIME_CONFLICT -> "Không thống nhất thời gian giao";
            case FACTORY_CONFIRM_LATE -> "Xưởng xác nhận quá hạn 24h";
            case CHANGE_ITEMS -> "Thay đổi sản phẩm hoặc số lượng";
            case CHANGE_ADDRESS -> "Thay đổi địa chỉ nhận hàng";
            case CHANGE_PAYMENT_METHOD -> "Thay đổi phương thức thanh toán";
            case DUPLICATE_ORDER -> "Đặt trùng đơn hàng";
            case OTHER -> "Lý do khác";
        };
    }

    private String getCancelReasonColor(CancelReason r) {
        return switch (r) {
            case CUSTOMER_CHANGED_MIND -> "#06b6d4"; 
            case OUT_OF_STOCK -> "#e11d48";          
            case DELIVERY_TIME_CONFLICT -> "#f59e0b"; 
            case FACTORY_CONFIRM_LATE -> "#64748b";  
            case CHANGE_ITEMS -> "#8b5cf6";
            case CHANGE_ADDRESS -> "#10b981";
            case CHANGE_PAYMENT_METHOD -> "#3b82f6";
            case DUPLICATE_ORDER -> "#f97316";
            case OTHER -> "#94a3b8";
        };
    }
}
