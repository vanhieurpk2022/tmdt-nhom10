package com.nhom10.tmdt.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "review-image")
public interface ReviewImage extends JpaRepository<ReviewImage,Long> {
}
