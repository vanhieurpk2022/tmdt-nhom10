package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.address.AddressResponse;
import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.UserStatus;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.Role;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCustomerServiceImp implements AdminCustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final RoleRepository roleRepository;

    private static final String[] AVATAR_TONES = {"pink", "blue", "slate", "mint"};

    @Override
    @Transactional(readOnly = true)
    public AdminCustomerPageResponse getCustomers(int page, int size, String search, UserStatus status, String role, String sortBy, String sortDir) {
        String safeSortBy = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, safeSortBy));

        String keyword = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<User> userPage;
        if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
            userPage = userRepository.searchUsersByRole(keyword, status, role.toUpperCase(), pageable);
        } else if (keyword != null) {
            userPage = userRepository.searchUsers(keyword, status, pageable);
        } else if (status != null) {
            userPage = userRepository.findByStatus(status, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<AdminCustomerResponse> customerList = userPage.getContent().stream()
                .map(this::mapToCustomerResponse)
                .toList();

        return AdminCustomerPageResponse.builder()
                .content(customerList)
                .pageNo(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .isLast(userPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCustomerStatsResponse getCustomerStats() {
        long total = userRepository.count();
        long active = userRepository.countByStatus(UserStatus.ACTIVE);
        long banned = userRepository.countByStatus(UserStatus.BANNED);
        long inactive = userRepository.countByStatus(UserStatus.INACTIVE);
        Double revenue = orderRepository.sumTotalRevenue();

        return AdminCustomerStatsResponse.builder()
                .totalCustomers(total)
                .activeCustomers(active)
                .bannedCustomers(banned)
                .inactiveCustomers(inactive)
                .totalRevenue(revenue != null ? revenue : 0.0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCustomerDetailResponse getCustomerDetail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng với ID: " + id));

        AdminCustomerResponse customer = mapToCustomerResponse(user);

        List<AddressResponse> addresses = Optional.ofNullable(user.getAddress())
                .orElse(Collections.emptyList())
                .stream()
                .map(a -> new AddressResponse(
                        a.getId(),
                        a.getRecipentName(),
                        a.getPhoneNumber(),
                        a.getStreet(),
                        a.getWard(),
                        a.getDistrict(),
                        a.getCity(),
                        a.isDefault()
                ))
                .toList();

        List<Order> recentOrdersList = orderRepository.findRecentOrdersByUserId(user.getId(), PageRequest.of(0, 5));
        List<AdminCustomerOrderSummary> orderSummaries = recentOrdersList.stream()
                .map(o -> AdminCustomerOrderSummary.builder()
                        .id(o.getId())
                        .createdAt(o.getCreatedAt())
                        .totalPrice(o.getTotalPrice())
                        .status(o.getStatus())
                        .recipientName(o.getRecipientName())
                        .shippingAddress(o.getShippingAddress())
                        .itemCount(o.getOrderItems() != null ? o.getOrderItems().size() : 0)
                        .build())
                .toList();

        return AdminCustomerDetailResponse.builder()
                .customer(customer)
                .addresses(addresses)
                .recentOrders(orderSummaries)
                .build();
    }

    @Override
    public AdminCustomerResponse updateCustomerStatus(Long id, UserStatus newStatus) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        user.setStatus(newStatus);
        User saved = userRepository.save(user);
        return mapToCustomerResponse(saved);
    }

    @Override
    public AdminCustomerResponse updateCustomerRoles(Long id, List<String> roleNames) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        Set<Role> updatedRoles = new HashSet<>();
        for (String roleName : roleNames) {
            roleRepository.findByName(roleName.toUpperCase())
                    .ifPresent(updatedRoles::add);
        }

        user.setRoles(updatedRoles);
        User saved = userRepository.save(user);
        return mapToCustomerResponse(saved);
    }

    @Override
    public AdminCustomerResponse updateCustomerInfo(Long id, UpdateCustomerInfoRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        if (request.fullname() != null && !request.fullname().isBlank()) {
            user.setFullname(request.fullname().trim());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone().trim());
        }
        if (request.birthday() != null) {
            user.setBirthday(request.birthday().trim());
        }
        if (request.gender() != null) {
            user.setGender(request.gender().trim());
        }

        User saved = userRepository.save(user);
        return mapToCustomerResponse(saved);
    }

    @Override
    public void deleteCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));

        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
    }

    private AdminCustomerResponse mapToCustomerResponse(User user) {
        String displayName = (user.getFullname() != null && !user.getFullname().isBlank())
                ? user.getFullname()
                : ((user.getUsername() != null && !user.getUsername().isBlank()) ? user.getUsername() : user.getEmail());

        long orderCount = orderRepository.countByUserId(user.getId());
        Double spent = orderRepository.sumTotalPriceByUserId(user.getId());
        double ltv = (spent != null) ? spent : 0.0;

        String tier;
        if (ltv >= 30_000_000) {
            tier = "VIP Diamond";
        } else if (ltv >= 10_000_000) {
            tier = "Gold (Vàng)";
        } else if (ltv >= 2_000_000) {
            tier = "Silver (Bạc)";
        } else if (orderCount > 0) {
            tier = "Thành viên mới";
        } else {
            tier = "Vãng lai";
        }

        String statusText;
        if (user.getStatus() == UserStatus.BANNED) {
            statusText = "Tạm khóa";
        } else if (user.getStatus() == UserStatus.INACTIVE || !user.isVerify()) {
            statusText = "Mới kích hoạt";
        } else {
            statusText = "Hoạt động";
        }

        String initials = computeInitials(displayName);
        int toneIndex = Math.abs((int) (user.getId() % AVATAR_TONES.length));
        String avatarTone = AVATAR_TONES[toneIndex];
        String recent = computeRecentActivity(user.getCreatedAt());

        Set<String> roleNames = Optional.ofNullable(user.getRoles())
                .orElse(Collections.emptySet())
                .stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AdminCustomerResponse.builder()
                .id(user.getId())
                .name(displayName)
                .fullname(user.getFullname())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone() != null ? user.getPhone() : "")
                .birthday(user.getBirthday())
                .gender(user.getGender())
                .avatarUrl(user.getAvatarUrl())
                .statusCode(user.getStatus())
                .status(statusText)
                .emailVerified(user.isVerify())
                .createdAt(user.getCreatedAt())
                .roles(roleNames)
                .tier(tier)
                .orders(orderCount)
                .ltv(ltv)
                .formulas(0)
                .formulaNote(orderCount > 0 ? (orderCount + " đơn hàng đã đặt") : "Chưa có đơn hàng")
                .recent(recent)
                .recentNote(user.isVerify() ? "Tài khoản đã xác thực" : "Chưa xác thực email")
                .initials(initials)
                .avatarTone(avatarTone)
                .risk(user.getStatus() == UserStatus.BANNED)
                .build();
    }

    private String computeInitials(String name) {
        if (name == null || name.isBlank()) return "KH";
        String[] words = name.trim().split("\\s+");
        if (words.length == 1) {
            return words[0].substring(0, Math.min(2, words[0].length())).toUpperCase();
        }
        return (words[0].substring(0, 1) + words[words.length - 1].substring(0, 1)).toUpperCase();
    }

    private String computeRecentActivity(LocalDateTime createdAt) {
        if (createdAt == null) return "Vừa tham gia";
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long days = duration.toDays();
        if (days == 0) {
            long hours = duration.toHours();
            if (hours == 0) {
                long minutes = duration.toMinutes();
                return minutes <= 0 ? "Vừa xong" : (minutes + " phút trước");
            }
            return hours + " giờ trước";
        } else if (days == 1) {
            return "Hôm qua";
        } else if (days < 30) {
            return days + " ngày trước";
        } else {
            return (days / 30) + " tháng trước";
        }
    }
}