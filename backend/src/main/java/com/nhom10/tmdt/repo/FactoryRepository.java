package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Factory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "factory")
public interface FactoryRepository extends JpaRepository<Factory, Long> {
}
