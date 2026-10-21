package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.dto.admin.FactoryRegisterResponse;
import com.nhom10.tmdt.dto.factory.FactoryUpdateRoleRequest;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.enums.FactoryRole;
import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.enums.RoleName;
import com.nhom10.tmdt.model.Factory;
import com.nhom10.tmdt.model.FactoryImage;
import com.nhom10.tmdt.model.Role;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.FactoryImageRepository;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.factory.FactoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImp implements AdminService{

    private final FactoryRepository factoryRepository;
    private final FactoryImageRepository factoryImageRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Override
    public List<FactoryRegisterResponse> factoryRegister() {
        List<Factory> factories =factoryRepository.findByFactoryStatus(FactoryStatus.PENDING);

        return factories.stream().map(factory -> {
            String avatarUrl = factoryImageRepository.findByFactoryId(factory.getId())
                    .stream()
                    .filter(FactoryImage::isAvatar)
                    .map(FactoryImage::getImageUrl)
                    .findFirst()
                    .orElse(null);

            return FactoryRegisterResponse.builder()
                    .id(factory.getId())
                    .name(factory.getName())
                    .address(factory.getAddress())
                    .factoryStatus(factory.getFactoryStatus())
                    .avatarUrl(avatarUrl)
                    .identity(factory.getIdentity())
                    .licenseUrl(factory.getLicenseUrl())
                    .originInvoiceUrl(factory.getOriginInvoiceUrl())
                    .tcssDocUrl(factory.getTccsDocUrl())
                    .build();
        }).toList();
    }

    @Override
    public void FactoryUpdateRole(FactoryUpdateRoleRequest request) {
            Factory factory = factoryRepository.findById(request.id()).orElseThrow(()->new AppException((ErrorCode.NOT_FOUND)));
            factory.setFactoryStatus(request.factoryStatus());

            User user = factory.getUsers().getFirst();
            Role factoryRole = roleRepository
                .findByName(RoleName.FACTORY.name())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            user.getRoles().add(factoryRole);
            user.setFactoryRole(FactoryRole.OWNER);

            userRepository.save(user);
    }
}
