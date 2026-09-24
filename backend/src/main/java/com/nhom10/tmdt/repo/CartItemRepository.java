package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "cart-item")
public interface CartItemRepository extends JpaRepository<CartItem,Long> {
}
