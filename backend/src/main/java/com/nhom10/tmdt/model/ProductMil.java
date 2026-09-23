package com.nhom10.tmdt.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name="product_mil")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductMil {
    @Id
    private Long id;

    private int mil;

    // private Product product;

}
