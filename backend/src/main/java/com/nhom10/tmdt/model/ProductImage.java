package com.nhom10.tmdt.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @Column(name="uploaded_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime uploadedAt;

    @ColumnDefault("0")
    @Column(name = "is_thumbnail", nullable = false)
    private boolean isThumbnail;

    /**
     * Xác định chai này dành cho custom (chai mẫu, chai gợi ý cho sản phẩm phối hương)
     */
    @ColumnDefault("0")
    @Column(name = "is_custom_example", nullable = false)
    @JsonProperty("isCustomExample")
    @JsonAlias({"isCustomSample", "isSampleBottle", "isCustom", "isSample", "isCustomBottle"})
    @Builder.Default
    private boolean isCustomExample = false;

    @ColumnDefault("0")
    @Column(name = "is_custom_sample", nullable = false)
    @JsonProperty("isCustomSample")
    @Builder.Default
    private boolean isCustomSample = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id")
    private Product product;

}
