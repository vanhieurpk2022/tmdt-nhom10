package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "voucher")
public interface VoucherRepository extends JpaRepository<Voucher,Long> {
}
