package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.SettlementPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface SettlementPaymentRepository extends JpaRepository<SettlementPayment, Long> {
    List<SettlementPayment> findByFactoryIdOrderByIdDesc(Long factoryId);
    Optional<SettlementPayment> findByTransactionCode(String code);
}
