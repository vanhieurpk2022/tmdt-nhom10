package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="order_item")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private int quantity;

    @Column(name="unit_price")
    private double unitPrice;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name="order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id")
     private Product product;
}
