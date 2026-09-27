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

    private String street;
    private String ward;
    private String city;
    @Column(name="is_default")
    private boolean isDefault;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User User;
}
