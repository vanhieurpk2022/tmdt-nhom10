package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.FactoryRole;
import com.nhom10.tmdt.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactoryStaffResponse {
    private Long id;
    private String fullname;
    private String email;
    private String phone;
    private FactoryRole factoryRole;
    private String factoryPosition;
    private UserStatus status;
    private LocalDateTime joinedAt;
    private String avatar;
}
