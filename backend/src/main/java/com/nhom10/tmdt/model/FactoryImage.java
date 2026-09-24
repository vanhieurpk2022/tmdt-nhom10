package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="factory_image")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactoryImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
