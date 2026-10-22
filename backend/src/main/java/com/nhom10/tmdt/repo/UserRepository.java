package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(path = "user")
public interface UserRepository extends JpaRepository<User,Long> {
    @org.springframework.data.rest.core.annotation.RestResource(exported = false)
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.email = :email")
    Optional<User> lockByEmail(String email);
     User findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsUserByEmail(String email);
}
