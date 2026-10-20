package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Order;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.nhom10.tmdt.enums.OrderStatus;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.time.Instant;
import org.springframework.data.domain.Pageable;

@RepositoryRestResource(exported = false)
public interface OrderRepository extends JpaRepository<Order,Long>, JpaSpecificationExecutor<Order> {
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

}

