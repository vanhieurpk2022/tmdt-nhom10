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

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface RefundRepository extends JpaRepository<Refund, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Refund r where r.id = :id")
    Optional<Refund> lockById(Long id);

    Optional<Refund> findByOrderIdAndRequestKey(Long orderId, String requestKey);
    List<Refund> findByOrderIdOrderByIdAsc(Long orderId);
    List<Refund> findAllByOrderByIdDesc(Pageable pageable);
    List<Refund> findByStatusInOrderByIdDesc(List<RefundStatus> statuses, Pageable pageable);

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

    @Query("""
    SELECT r FROM Refund r
    JOIN r.order o
    WHERE o.user.id = :userId
    ORDER BY r.createdAt DESC
    """)
    java.util.List<Refund> findByUserId(@Param("userId") Long userId);
}
