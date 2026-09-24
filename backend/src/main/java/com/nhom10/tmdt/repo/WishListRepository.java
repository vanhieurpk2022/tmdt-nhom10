package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.WishList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "wish-list")
public interface WishListRepository extends JpaRepository<WishList,Long> {
}
