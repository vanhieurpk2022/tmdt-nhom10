package com.nhom10.tmdt.dto.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateCustomerInfoRequest {
    private String fullname;
    private String phone;
    private String birthday;
    private String gender;
    private String cskhNote;

    public String fullname() { return fullname; }
    public String phone() { return phone; }
    public String birthday() { return birthday; }
    public String gender() { return gender; }
    public String cskhNote() { return cskhNote; }
}