package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.FactorySettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface FactorySettlementRepository extends JpaRepository<FactorySettlement, Long> {

    List<FactorySettlement> findByFactoryIdOrderByCreatedAtDesc(Long factoryId);

    List<FactorySettlement> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(fs.amount), 0.0) FROM FactorySettlement fs WHERE fs.factory.id = :factoryId AND fs.status = 'COMPLETED'")
    Double sumDisbursedByFactoryId(@Param("factoryId") Long factoryId);

    @Query("SELECT COALESCE(SUM(fs.amount), 0.0) FROM FactorySettlement fs WHERE fs.status = 'COMPLETED'")
    Double sumTotalDisbursed();

    @Query("SELECT COALESCE(SUM(fs.platformFee), 0.0) FROM FactorySettlement fs WHERE fs.status = 'COMPLETED'")
    Double sumTotalPlatformFeeCollected();
}

