package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.RefundStatus;
import com.nhom10.tmdt.model.Refund;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface RefundRepository extends JpaRepository<Refund, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Refund r where r.id = :id")
    Optional<Refund> lockById(Long id);

    Optional<Refund> findByOrderIdAndRequestKey(Long orderId, String requestKey);
    List<Refund> findByOrderIdOrderByIdAsc(Long orderId);
    List<Refund> findByStatusOrderByIdAsc(RefundStatus status, Pageable pageable);

    @Query("""
            select r.id from Refund r where r.status in
                (com.nhom10.tmdt.enums.RefundStatus.PROCESSING, com.nhom10.tmdt.enums.RefundStatus.NEEDS_REVIEW)
                and r.providerRequestId is not null and r.providerRequestedAt <= :before
                and r.id > :afterId order by r.id
            """)
    List<Long> findAwaitingReconciliationIds(Instant before, long afterId, Pageable pageable);

    @Query("""
        SELECT COUNT(DISTINCT r)
        FROM Refund r
        JOIN r.order o
        JOIN o.orderItems oi
        JOIN oi.product p
        WHERE p.factory.id = :factoryId
          AND r.status = :status
        """)
    long countByFactoryIdAndStatus(
            @Param("factoryId") Long factoryId,
            @Param("status") RefundStatus status
    );


    @Query("""
    SELECT COUNT(DISTINCT r)
    FROM Refund r
    JOIN r.order o
    JOIN o.orderItems oi
    JOIN oi.product p
    WHERE p.factory.id = :factoryId
      AND r.status IN (
          com.nhom10.tmdt.enums.RefundStatus.REQUESTED,
          com.nhom10.tmdt.enums.RefundStatus.APPROVED,
          com.nhom10.tmdt.enums.RefundStatus.PROCESSING,
          com.nhom10.tmdt.enums.RefundStatus.NEEDS_REVIEW
      )
    """)
    long countOpenByFactoryId(
            @Param("factoryId") Long factoryId
    );
}
