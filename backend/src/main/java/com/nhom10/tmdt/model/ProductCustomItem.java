package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="product_custom_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name="volume_ml")
    private double volumeM1;
    private double percentage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_Custom_id")
    private ProductCustom productCustom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id")
    private Product product;
}
