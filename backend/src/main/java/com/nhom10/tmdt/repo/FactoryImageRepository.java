package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.FactoryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "factory-image")
public interface FactoryImageRepository extends JpaRepository<FactoryImage,Long> {
    List<FactoryImage> findByFactoryId(Long factoryId);
}
