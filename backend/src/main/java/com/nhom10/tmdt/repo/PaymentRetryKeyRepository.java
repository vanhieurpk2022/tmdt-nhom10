package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.PaymentRetryKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface PaymentRetryKeyRepository extends JpaRepository<PaymentRetryKey, Long> {
    Optional<PaymentRetryKey> findByOrderIdAndRequestKey(Long orderId, String requestKey);
}
