package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="product")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;
    private String description;


    @Formula("(SELECT MIN(pm.price) FROM product_mil pm WHERE pm.product_id = id AND pm.is_active = true)")
    @Column(name="min_price")
    private Double price;

    @Column(name="created_at")
    private LocalDateTime createdAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Column(name="product_type")
    @Enumerated(EnumType.STRING)
    private ProductType productType;

    @OneToMany(mappedBy = "product")
    private List<ProductCustomItem> productCustomItems;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="factory_id")
    private Factory factory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductImage> productImages;

    // here
    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name="wish_list_id")
    private WishList wishList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="sale_id")
    private Sales sale;

    @OneToMany(mappedBy = "product")
    private List<ProductMil> productMils;

    @OneToMany(mappedBy = "product")
    private List<Review> reviews;
}

