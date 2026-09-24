package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "refund")
public interface RefundRepository extends JpaRepository<Refund, Long> {
}
