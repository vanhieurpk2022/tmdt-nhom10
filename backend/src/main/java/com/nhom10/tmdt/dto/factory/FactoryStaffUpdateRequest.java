package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactoryStaffUpdateRequest {
    private String fullname;
    private String phone;
    private String factoryPosition;
    private UserStatus status;
}
