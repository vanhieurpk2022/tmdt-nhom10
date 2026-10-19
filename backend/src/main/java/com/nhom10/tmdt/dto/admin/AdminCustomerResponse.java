package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerResponse {
    private Long id;
    private String name;
    private String fullname;
    private String username;
    private String email;
    private String phone;
    private String birthday;
    private String gender;
    private String avatarUrl;
    private UserStatus statusCode;
    private String status;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private Set<String> roles;

    private String tier;
    private long orders;
    private double ltv;
    private int formulas;
    private String formulaNote;
    private String recent;
    private String recentNote;
    private String initials;
    private String avatarTone;
    private boolean risk;
}