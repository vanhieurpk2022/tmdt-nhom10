package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Collection;
import java.util.List;

@RepositoryRestResource(exported = false)
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
            SELECT oi.product.id, COALESCE(SUM(oi.quantity), 0)
            FROM OrderItem oi
            WHERE oi.product.id IN :productIds
              AND oi.order.status NOT IN :excludedOrderStatuses
              AND (oi.order.paymentStatus IS NULL OR oi.order.paymentStatus NOT IN :excludedPaymentStatuses)
            GROUP BY oi.product.id
            """)
    List<Object[]> sumSoldByProductIds(
            @Param("productIds") Collection<Long> productIds,
            @Param("excludedOrderStatuses") Collection<OrderStatus> excludedOrderStatuses,
            @Param("excludedPaymentStatuses") Collection<PaymentStatus> excludedPaymentStatuses
    );

    @Query("""
            SELECT oi.product.id, COALESCE(SUM(oi.quantity), 0)
            FROM OrderItem oi
            WHERE oi.product IS NOT NULL
              AND oi.order.status NOT IN :excludedOrderStatuses
              AND (oi.order.paymentStatus IS NULL OR oi.order.paymentStatus NOT IN :excludedPaymentStatuses)
            GROUP BY oi.product.id
            """)
    List<Object[]> sumSoldGroupedByProduct(
            @Param("excludedOrderStatuses") Collection<OrderStatus> excludedOrderStatuses,
            @Param("excludedPaymentStatuses") Collection<PaymentStatus> excludedPaymentStatuses
    );
}
