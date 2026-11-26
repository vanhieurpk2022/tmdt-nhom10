package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;

/** Lưu đúng biến thể và số chai đã xuất, dùng lại khi hủy/hoàn kho. */
@Entity
@Table(name = "inventory_allocation")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class InventoryAllocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) private Order order;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_mil_id", nullable = false) private ProductMil variant;
    @Column(nullable = false) private int quantity;
}
