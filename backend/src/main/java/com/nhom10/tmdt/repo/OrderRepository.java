package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "order")
public interface OrderRepository extends JpaRepository<Order,Long> {
    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.user.id = :userId AND o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED")
    Double sumTotalPriceByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.status != com.nhom10.tmdt.enums.OrderStatus.CANCELLED")
    Double sumTotalRevenue();
}