package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.nhom10.tmdt.enums.OrderStatus;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
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
}
