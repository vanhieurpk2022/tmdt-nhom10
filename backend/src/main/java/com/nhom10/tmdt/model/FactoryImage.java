package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="factory_image")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactoryImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    @Column(name="image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="factory_id")
    private Factory factory;

    @Column(name="is_avatar")
    private boolean isAvatar;
    @Column(name="is_banner")
    private boolean isBanner;
}
