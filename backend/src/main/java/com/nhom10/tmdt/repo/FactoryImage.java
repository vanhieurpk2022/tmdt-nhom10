package com.nhom10.tmdt.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "factory-image")
public interface FactoryImage extends JpaRepository<FactoryImage,Long> {
}
