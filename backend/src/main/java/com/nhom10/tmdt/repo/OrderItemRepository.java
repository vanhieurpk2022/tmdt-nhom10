package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "order-item")
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
