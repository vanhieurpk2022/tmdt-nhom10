package com.nhom10.tmdt.service.address;

import com.nhom10.tmdt.dto.address.AddressRequest;
import com.nhom10.tmdt.dto.address.AddressResponse;

import java.util.List;

// Giao diện xử lý nghiệp vụ quản lý sổ địa chỉ của người dùng
public interface AddressService {

    // Lấy danh sách địa chỉ của người dùng theo email
    List<AddressResponse> getUserAddresses(String email);

    // Thêm địa chỉ mới cho người dùng
    AddressResponse addAddress(String email, AddressRequest request);

    // Cập nhật địa chỉ theo mã id
    AddressResponse updateAddress(String email, Long addressId, AddressRequest request);

    // Xóa địa chỉ theo mã id
    void deleteAddress(String email, Long addressId);

    // Đặt địa chỉ làm mặc định
    void setDefaultAddress(String email, Long addressId);
}
