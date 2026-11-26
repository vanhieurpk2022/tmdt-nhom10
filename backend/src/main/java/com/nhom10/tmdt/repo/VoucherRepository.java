package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "voucher")
public interface VoucherRepository extends JpaRepository<Voucher,Long> {
    java.util.Optional<Voucher> findByCode(String code);
    java.util.List<Voucher> findByFactoryIdOrderByIdDesc(Long factoryId);
    @org.springframework.data.rest.core.annotation.RestResource(exported = false)
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select v from Voucher v where v.code = :code")
    java.util.Optional<Voucher> lockByCode(@org.springframework.data.repository.query.Param("code") String code);
}
