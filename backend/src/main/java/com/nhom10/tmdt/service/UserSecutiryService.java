package com.nhom10.tmdt.service;

import com.nhom10.tmdt.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;


public interface UserSecutiryService extends UserDetailsService {
    public User findByUsername(String username);
}
