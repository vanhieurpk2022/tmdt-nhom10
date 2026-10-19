package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.enums.UserStatus;
import com.nhom10.tmdt.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(path = "user")
public interface UserRepository extends JpaRepository<User,Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsUserByEmail(String email);

    long countByStatus(UserStatus status);
    Page<User> findByStatus(UserStatus status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "(u.phone IS NOT NULL AND u.phone LIKE CONCAT('%', :keyword, '%')) OR " +
           "(u.username IS NOT NULL AND LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<User> searchUsers(@Param("keyword") String keyword, @Param("status") UserStatus status, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE " +
           "r.name = :roleName AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "(u.phone IS NOT NULL AND u.phone LIKE CONCAT('%', :keyword, '%')) OR " +
           "(u.username IS NOT NULL AND LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<User> searchUsersByRole(@Param("keyword") String keyword, @Param("status") UserStatus status, @Param("roleName") String roleName, Pageable pageable);
}