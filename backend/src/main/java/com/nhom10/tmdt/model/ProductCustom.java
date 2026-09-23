package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name="product_custom")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustom {
    @Id
    private Long id;

    @Column(name="bottle_Type")
    private String bottleType;

    @Column(name="label_design")
    private String labelDesign;
    @Column(name="total_volumeMl")
    private Double totalVolumeMl;
    private double price;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;


    private Product product;
    @OneToMany(mappedBy = "productCustom", cascade = {CascadeType.ALL})
    private List<ProductCustomItem> items;
}
