package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="product_image")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name="image_url")
    private String imageUrl;

    @Column(name="uploaded_at")
    @UpdateTimestamp
    private LocalDateTime uploadedAt;

    @ColumnDefault("0")
    @Column(name = "is_thumbnail", nullable = false)
    private boolean isThumbnail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id")
    private Product product;

}
