package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "sales")
public interface SalesRepository extends JpaRepository<Sales,Long> {
}
