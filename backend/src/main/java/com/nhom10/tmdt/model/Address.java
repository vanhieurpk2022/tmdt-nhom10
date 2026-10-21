package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="address")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name="recipient_name")
    private String recipentName;

    @Column(name="phone_number")
    private String phoneNumber;

    // Tên đường, số nhà cụ thể
    private String street;

    // Phường / Xã
    private String ward;

    // Quận / Huyện
    private String district;

    // Tỉnh / Thành phố
    private String city;

    // Đánh dấu địa chỉ mặc định
    @Column(name="is_default")
    private boolean isDefault;

    // Người dùng sở hữu địa chỉ này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;
}
