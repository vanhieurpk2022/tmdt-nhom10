package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(path = "user")
public interface UserRepository extends JpaRepository<User,Long> {
    public User findByUsername(String username);
}
