package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(path = "cart")
public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByUserEmail(String email);
}
