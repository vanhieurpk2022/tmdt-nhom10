package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import java.util.List;

@RepositoryRestResource(exported = false)
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByUserEmailOrderByIdDesc(String email);
    List<SupportTicket> findByFactoryIdOrderByIdDesc(Long factoryId);
}
