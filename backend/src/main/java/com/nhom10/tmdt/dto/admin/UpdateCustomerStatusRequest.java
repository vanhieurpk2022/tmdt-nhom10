package com.nhom10.tmdt.dto.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhom10.tmdt.enums.UserStatus;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateCustomerStatusRequest {
    private UserStatus status;
    public UserStatus status() { return status; }
}