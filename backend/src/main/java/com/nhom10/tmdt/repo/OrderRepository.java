package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "factory-image")
public interface OrderRepository extends JpaRepository<Order,Long> {
}
