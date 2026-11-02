package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // --- Quản trị khách hàng & thống kê user ---
    long countByUserId(Long userId);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.user.id = :userId AND o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED")
    Double sumTotalPriceByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED")
    Double sumTotalRevenue();

    // --- Khóa & tra cứu đơn hàng checkout ---
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> lockById(Long id);

    Optional<Order> findByIdAndUserEmail(Long id, String email);

    Optional<Order> findByUserEmailAndCheckoutKey(String email, String checkoutKey);

    @Query("select o.status as status, count(o) as total from Order o where o.user.email = :email group by o.status")
    List<StatusCount> countStatuses(String email);

    interface StatusCount {
        OrderStatus getStatus();
        long getTotal();
    }

    @Query("""
            select coalesce(sum(case when
                o.paymentStatus = com.nhom10.tmdt.enums.PaymentStatus.PAID
                or (o.paymentMethod = com.nhom10.tmdt.enums.PaymentMethod.COD
                    and o.status = com.nhom10.tmdt.enums.OrderStatus.DELIVERED)
                then o.totalPrice else 0.0 end), 0.0)
            from Order o where o.user.email = :email
                and o.status not in (com.nhom10.tmdt.enums.OrderStatus.CANCELLED,
                    com.nhom10.tmdt.enums.OrderStatus.RETURNED, com.nhom10.tmdt.enums.OrderStatus.REFUNDED)
                and (o.paymentStatus is null or o.paymentStatus not in
                    (com.nhom10.tmdt.enums.PaymentStatus.REFUND_PENDING, com.nhom10.tmdt.enums.PaymentStatus.REFUNDED))
            """)
    double totalSpent(String email);

    @Query("select o.id from Order o where o.status = com.nhom10.tmdt.enums.OrderStatus.PENDING_PAYMENT and o.reservationExpiresAt <= :now and not exists (select a.id from PaymentAttempt a where a.orderId = o.id and a.status = 'NEEDS_REVIEW') order by o.id")
    List<Long> findExpiredIds(Instant now, Pageable pageable);

    /**
     * Lấy tất cả đơn hàng thuộc factory (qua OrderItem → Product → Factory)
     * trong khoảng thời gian nhất định.
     */
    @Query("""
    SELECT DISTINCT o FROM Order o
    JOIN o.orderItems oi
    JOIN oi.product p
    WHERE p.factory.id = :factoryId
    ORDER BY o.createdAt DESC
    """)
    List<Order> findLatestOrders(
            @Param("factoryId") Long factoryId,
            Pageable pageable
    );

    /**
     * Đếm tổng đơn hàng của factory trong khoảng thời gian.
     */
    @Query("""
            SELECT COUNT(DISTINCT o) FROM Order o
            JOIN o.orderItems oi JOIN oi.product p
            WHERE p.factory.id = :factoryId AND o.createdAt >= :from
            """)
    long countByFactoryId(@Param("factoryId") Long factoryId,
                          @Param("from") LocalDateTime from);

    /**
     * Đếm đơn mới chờ xác nhận (PENDING) của factory.
     */
    @Query("""
            SELECT COUNT(DISTINCT o) FROM Order o
            JOIN o.orderItems oi JOIN oi.product p
            WHERE p.factory.id = :factoryId AND o.status = :status
            """)
    long countByFactoryIdAndStatus(@Param("factoryId") Long factoryId,
                                   @Param("status") OrderStatus status);

    /**
     * Đếm đơn hủy theo từng lý do.
     */
    @Query("""
            SELECT o.cancelReason, COUNT(DISTINCT o) FROM Order o
            JOIN o.orderItems oi JOIN oi.product p
            WHERE p.factory.id = :factoryId
              AND o.status = 'CANCELLED'
              AND o.cancelReason IS NOT NULL
              AND o.createdAt >= :from
            GROUP BY o.cancelReason
            """)
    List<Object[]> countCancelledGroupByReason(@Param("factoryId") Long factoryId,
                                               @Param("from") LocalDateTime from);

    /**
     * Đếm đơn đã giao (DELIVERED) và đơn giao đúng hạn.
     */
    @Query("""
            SELECT COUNT(DISTINCT o),
                   SUM(CASE WHEN o.deliveredAt <= o.expectedDeliveryAt THEN 1 ELSE 0 END)
            FROM Order o
            JOIN o.orderItems oi JOIN oi.product p
            WHERE p.factory.id = :factoryId
              AND o.status = 'DELIVERED'
              AND o.createdAt >= :from
            """)
    List<Object[]> countDeliveryStats(@Param("factoryId") Long factoryId,
                                      @Param("from") LocalDateTime from);

    /**
     * Tính tổng doanh thu đơn hàng (totalPrice) cho factory.
     */
    @Query("""
            SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o
            JOIN o.orderItems oi JOIN oi.product p
            WHERE p.factory.id = :factoryId
              AND o.status NOT IN ('CANCELLED', 'REFUNDED')
              AND o.createdAt >= :from
            """)
    long sumRevenueByFactoryId(@Param("factoryId") Long factoryId,
                               @Param("from") LocalDateTime from);

    /**
     * Lấy tất cả đơn hàng thuộc factory trong khoảng [from, to] — dùng cho biểu đồ dashboard.
     */
    @Query("""
            SELECT DISTINCT o FROM Order o
            JOIN o.orderItems oi
            JOIN oi.product p
            WHERE p.factory.id = :factoryId
              AND o.createdAt >= :from
              AND o.createdAt <= :to
            ORDER BY o.createdAt ASC
            """)
    List<Order> findOrdersByFactoryIdAndDateRange(
            @Param("factoryId") Long factoryId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Đếm đơn hàng theo từng trạng thái của factory — dùng cho biểu đồ tròn
     */
    @Query("""
            SELECT o.status, COUNT(DISTINCT o) FROM Order o
            JOIN o.orderItems oi
            JOIN oi.product p
            WHERE p.factory.id = :factoryId
            GROUP BY o.status
            """)
    List<Object[]> countOrdersGroupByStatus(@Param("factoryId") Long factoryId);

    // ==========================================
    // THỐNG KÊ TOÀN SÀN DÀNH CHO ADMIN DASHBOARD
    // ==========================================

    /**
     * Lấy tất cả đơn hàng toàn sàn trong khoảng [from, to] — dùng cho biểu đồ cột theo thời gian
     */
    @Query("""
            SELECT o FROM Order o
            WHERE o.createdAt >= :from
              AND o.createdAt <= :to
            ORDER BY o.createdAt ASC
            """)
    List<Order> findAllOrdersInDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Phân bổ trạng thái toàn bộ đơn hàng trên sàn — dùng cho biểu đồ tròn
     */
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countAllOrdersGroupByStatus();

    /**
     * Phân bổ lý do hủy đơn toàn sàn — dùng cho biểu đồ tròn lý do hủy
     */
    @Query("""
            SELECT o.cancelReason, COUNT(o) FROM Order o
            WHERE o.status = com.nhom10.tmdt.enums.OrderStatus.CANCELLED
              AND o.cancelReason IS NOT NULL
            GROUP BY o.cancelReason
            """)
    List<Object[]> countAllCancelledGroupByReason();

    /**
     * Phân bổ theo phương thức thanh toán toàn sàn (COD, VNPAY) — dùng cho biểu đồ tròn
     */
    @Query("SELECT o.paymentMethod, COUNT(o), COALESCE(SUM(o.totalPrice), 0.0) FROM Order o GROUP BY o.paymentMethod")
    List<Object[]> countAllOrdersGroupByPaymentMethod();

    /**
     * Phân bổ doanh thu theo từng Danh mục sản phẩm toàn sàn — dùng cho biểu đồ tròn danh mục
     */
    @Query("""
            SELECT c.id, c.name, COALESCE(SUM(oi.quantity * oi.unitPrice), 0.0), SUM(oi.quantity), COUNT(DISTINCT o)
            FROM OrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            JOIN p.category c
            WHERE o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED
            GROUP BY c.id, c.name
            ORDER BY SUM(oi.quantity * oi.unitPrice) DESC
            """)
    List<Object[]> findRevenueGroupByCategory();

    /**
     * Phân bổ doanh thu theo từng Xưởng chế tác gia công — dùng cho biểu đồ tròn xưởng đối tác
     */
    @Query("""
            SELECT f.id, f.name, COALESCE(SUM(oi.quantity * oi.unitPrice), 0.0), COUNT(DISTINCT o)
            FROM OrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            JOIN p.factory f
            WHERE o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED
            GROUP BY f.id, f.name
            ORDER BY SUM(oi.quantity * oi.unitPrice) DESC
            """)
    List<Object[]> findRevenueGroupByFactory();

    /**
     * Phân bổ doanh thu theo Loại sản phẩm (NORMAL vs CUSTOM) — dùng cho biểu đồ tròn loại SP
     */
    @Query("""
            SELECT p.productType, COUNT(DISTINCT o), COALESCE(SUM(oi.quantity * oi.unitPrice), 0.0)
            FROM OrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            WHERE o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED
            GROUP BY p.productType
            """)
    List<Object[]> sumRevenueGroupByProductType();

    /**
     * Tổng doanh thu các đơn hàng đã giao thành công (thực thu)
     */
    @Query("""
            SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o
            WHERE o.status = com.nhom10.tmdt.enums.OrderStatus.DELIVERED
            """)
    Double sumDeliveredRevenue();
}
