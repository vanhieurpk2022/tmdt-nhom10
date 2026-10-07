package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name="product_custom")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name="bottle_Type")
    private String bottleType;

    @Column(name="label_design")
    private String labelDesign;
    @Column(name="total_volumeMl")
    private Double totalVolumeMl;
    private double price;
    @Column(name="created_at")
    @CreationTimestamp
    private LocalDateTime createdAt ;
    @Column(name="updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "productCustom")
    private List<ProductCustomItem> items;
}
