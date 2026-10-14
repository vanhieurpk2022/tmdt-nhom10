package com.nhom10.tmdt.service.address;

import com.nhom10.tmdt.dto.address.AddressRequest;
import com.nhom10.tmdt.dto.address.AddressResponse;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.model.Address;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.AddressRepository;
import com.nhom10.tmdt.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Triển khai dịch vụ quản lý sổ địa chỉ của người dùng
@Service
@RequiredArgsConstructor
public class AddressServiceImp implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    // Lấy danh sách địa chỉ của người dùng, sắp xếp địa chỉ mặc định lên đầu
    @Override
    public List<AddressResponse> getUserAddresses(String email) {
        List<Address> addresses = addressRepository.findByUserEmailOrderByIsDefaultDescIdDesc(email);
        return addresses.stream().map(this::mapToResponse).toList();
    }

    // Thêm địa chỉ mới
    @Override
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        List<Address> userAddresses = addressRepository.findByUserEmail(email);

        // Nếu người dùng chưa có địa chỉ nào, hoặc request chọn là mặc định
        boolean makeDefault = userAddresses.isEmpty() || Boolean.TRUE.equals(request.isDefault());

        if (makeDefault && !userAddresses.isEmpty()) {
            // Hủy mặc định của các địa chỉ hiện tại
            for (Address addr : userAddresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
        }

        Address address = Address.builder()
                .recipentName(request.recipentName())
                .phoneNumber(request.phoneNumber())
                .street(request.street())
                .ward(request.ward())
                .district(request.district())
                .city(request.city())
                .isDefault(makeDefault)
                .user(user)
                .build();

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    // Cập nhật địa chỉ hiện có
    @Override
    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Nếu chọn làm mặc định và trước đó chưa mặc định
        if (Boolean.TRUE.equals(request.isDefault()) && !address.isDefault()) {
            List<Address> userAddresses = addressRepository.findByUserEmail(email);
            for (Address addr : userAddresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
            address.setDefault(true);
        }

        if (request.recipentName() != null) address.setRecipentName(request.recipentName());
        if (request.phoneNumber() != null) address.setPhoneNumber(request.phoneNumber());
        if (request.street() != null) address.setStreet(request.street());
        if (request.ward() != null) address.setWard(request.ward());
        if (request.district() != null) address.setDistrict(request.district());
        if (request.city() != null) address.setCity(request.city());

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    // Xóa địa chỉ
    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        // Nếu xóa địa chỉ mặc định, tự động gán địa chỉ còn lại đầu tiên làm mặc định
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserEmail(email);
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setDefault(true);
                addressRepository.save(first);
            }
        }
    }

    // Đặt một địa chỉ làm mặc định
    @Override
    @Transactional
    public void setDefaultAddress(String email, Long addressId) {
        Address targetAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!targetAddress.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        List<Address> userAddresses = addressRepository.findByUserEmail(email);
        for (Address addr : userAddresses) {
            addr.setDefault(addr.getId().equals(addressId));
            addressRepository.save(addr);
        }
    }

    // Chuyển đổi Entity Address sang DTO AddressResponse
    private AddressResponse mapToResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getRecipentName(),
                address.getPhoneNumber(),
                address.getStreet(),
                address.getWard(),
                address.getDistrict(),
                address.getCity(),
                address.isDefault()
        );
    }
}
