package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "product_mil" , uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "mil"}))
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductMil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private int mil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id")
    private Product product;

    @Column(name="base_price")
    private Double basePrice;

    @Column(nullable = true)
    private Double price;


    @Column(name="stock_quantity")
    private int stockQuantity;

    @ColumnDefault("1")
    @Column(name="is_active")
    private boolean isActive;
}
