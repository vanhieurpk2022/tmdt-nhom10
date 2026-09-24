package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "review")
public interface ReviewRepository extends JpaRepository<Review,Long> {
}
