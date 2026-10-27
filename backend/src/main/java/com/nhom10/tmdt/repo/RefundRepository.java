package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.RefundStatus;
import com.nhom10.tmdt.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByOrderIdOrderByIdAsc(Long orderId);

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
