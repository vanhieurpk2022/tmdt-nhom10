package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "category")
public interface CategoryRepository extends JpaRepository<Category,Long> {
}
