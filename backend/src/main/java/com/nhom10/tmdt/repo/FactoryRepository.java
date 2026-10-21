package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.model.Factory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(path = "factory")
public interface FactoryRepository extends JpaRepository<Factory, Long> {
    List<Factory> findByFactoryStatus(FactoryStatus status);
}
