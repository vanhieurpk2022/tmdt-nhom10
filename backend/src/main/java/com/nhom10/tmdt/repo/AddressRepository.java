package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@RepositoryRestResource(path = "address")
public interface AddressRepository extends JpaRepository<Address, Long> {
    // Tìm danh sách địa chỉ theo email người dùng, sắp xếp địa chỉ mặc định lên đầu
    List<Address> findByUserEmailOrderByIsDefaultDescIdDesc(String email);
    
    // Tìm danh sách địa chỉ theo email người dùng
    List<Address> findByUserEmail(String email);
}
