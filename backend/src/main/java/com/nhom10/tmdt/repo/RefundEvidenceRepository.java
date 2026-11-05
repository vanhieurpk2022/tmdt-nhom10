package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.RefundEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
public interface RefundEvidenceRepository extends JpaRepository<RefundEvidence,Long> {
}
