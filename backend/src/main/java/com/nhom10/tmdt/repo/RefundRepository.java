package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "refund")
public interface RefundRepository extends JpaRepository<Refund, Long> {
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
            @Param("status") OrderStatus status
    );


    @Query("""
    SELECT COUNT(DISTINCT r)
    FROM Refund r
    JOIN r.order o
    JOIN o.orderItems oi
    JOIN oi.product p
    WHERE p.factory.id = :factoryId
      AND r.status = 'PENDING'
    """)
    long countOpenByFactoryId(
            @Param("factoryId") Long factoryId
    );
}
