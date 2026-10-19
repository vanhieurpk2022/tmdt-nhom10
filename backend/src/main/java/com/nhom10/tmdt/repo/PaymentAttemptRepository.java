package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.PaymentAttempt;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

@RepositoryRestResource(exported = false)
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {
    Optional<PaymentAttempt> findByTxnRef(String txnRef);
    List<PaymentAttempt> findByOrderIdOrderByIdDesc(Long orderId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from PaymentAttempt a where a.id = :id")
    Optional<PaymentAttempt> lockById(Long id);
    @Query("select a.id from PaymentAttempt a where a.status = 'INITIATED' and a.expiresAt <= :now order by a.id")
    List<Long> findUnresolvedIds(Instant now, Pageable pageable);
    @Query("""
            select a.id from PaymentAttempt a where a.status in ('INITIATED', 'EXPIRED', 'NEEDS_REVIEW')
                and a.merchantCode = :merchant and a.createdAt <= :before and a.id > :afterId
                and (a.status = 'INITIATED' or exists
                    (select e.id from PaymentEvent e where e.attemptId = a.id and e.status = 'OPEN'))
            order by a.id
            """)
    List<Long> findAwaitingConfirmationIds(Instant before, String merchant, long afterId, Pageable pageable);
    boolean existsByMerchantCodeAndReceiptNoAndIdNot(String merchantCode, String receiptNo, Long id);
}
