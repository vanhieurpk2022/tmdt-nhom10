package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.FactoryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="factory")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Factory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    private String name;
    private String address;

    @Column(name="account_holder")
    private String accountHolder;

    @Column(name="account_number")
    private String accountNumber;

    @Column(name="shop_phone")
    private String shopPhone;

    private String description;

    @Column(name="fullname_repre")
    private String fullNameRepre;

    private String identity;

    @Column(name="license_url")
    private String licenseUrl;

    @Column(name="cosmetic_license_url")
    private String cosmeticLicenseUrl;

    @Column(name="tccs_doc_url")
    private String tccsDocUrl;

    @Column(name="origin_invoice_url")
    private String originInvoiceUrl;

    @Column(name="brand_authorization_url")
    private String brandAuthorizationUrl;

    // 0: cá nhân
    // 1: doanh nghiệp
    @Column(name="type_factory")
    private Integer typeFactory;

    @Enumerated(EnumType.STRING)
    private FactoryStatus factoryStatus;

    @Column(name="custom_service_fee")
    private Double customServiceFee;

    @Column(name="created_at")
    @CreationTimestamp
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name="updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    @OneToMany(mappedBy = "factory")
    private List<User> User;

    @OneToMany(mappedBy = "factory")
    private List<Product> products;

    @OneToMany(mappedBy = "factory")
    private List<FactoryImage> factoryImages;
}
