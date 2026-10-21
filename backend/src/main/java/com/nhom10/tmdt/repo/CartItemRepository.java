package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(path = "cart-item")
public interface CartItemRepository extends JpaRepository<CartItem,Long> {
    List<CartItem> findByCartIdOrderByIdAsc(Long cartId);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    Optional<CartItem> findByIdAndCartUserEmail(Long id, String email);

    void deleteAllByCartUserEmail(String email);
}
