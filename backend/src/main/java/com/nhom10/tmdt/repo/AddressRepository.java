package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@RepositoryRestResource(path = "address")
public interface AddressRepository extends JpaRepository<Address,Long> {
}
