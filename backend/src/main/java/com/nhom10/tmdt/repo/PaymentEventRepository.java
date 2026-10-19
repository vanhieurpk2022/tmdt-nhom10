package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.PaymentEvent;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import java.util.*;

@RepositoryRestResource(exported = false)
public interface PaymentEventRepository extends JpaRepository<PaymentEvent, Long> {
    boolean existsByEventKey(String eventKey);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from PaymentEvent e where e.eventKey = :key")
    Optional<PaymentEvent> findLockedByEventKey(String key);
    List<PaymentEvent> findByStatusOrderByIdAsc(String status, Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from PaymentEvent e where e.id = :id")
    Optional<PaymentEvent> lockById(Long id);
}
