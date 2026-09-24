package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "review-image")
public interface ReviewImageRepository extends JpaRepository<ReviewImage,Long> {
}
