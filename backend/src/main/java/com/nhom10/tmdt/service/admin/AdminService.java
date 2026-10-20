package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.FactoryRegisterResponse;
import com.nhom10.tmdt.dto.factory.FactoryUpdateRoleRequest;

import java.util.List;

public interface AdminService {
    List<FactoryRegisterResponse> factoryRegister();
    void FactoryUpdateRole(FactoryUpdateRoleRequest request);
}
