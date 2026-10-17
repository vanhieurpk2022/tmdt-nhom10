package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;

@RepositoryRestResource(path = "orders")
public interface OrderRepository extends JpaRepository<Order, Long> {

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

