package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.model.Role;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.UserSecutiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserSecuritySeviceImp implements UserSecutiryService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username);
        if(user == null) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        org.springframework.security.core.userdetails.User userDetail = new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), rolesToAuthorities(user.getRoles()));
        return userDetail;
    }

    // Hàm để lấy role
    private Collection<? extends GrantedAuthority> rolesToAuthorities(Collection<Role> roles) {
        return roles.stream().map(role -> new SimpleGrantedAuthority(role.getName())).collect(Collectors.toList());
    }
}
