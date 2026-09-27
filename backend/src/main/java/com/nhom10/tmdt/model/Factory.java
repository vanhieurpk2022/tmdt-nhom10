package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.FactoryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="factory")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Factory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    private String name;
    private String address;
    private String description;
    @Enumerated(EnumType.STRING)
    private FactoryStatus factoryStatus;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;


    @OneToMany(mappedBy = "factory")
    private List<User> User;

    @OneToMany(mappedBy = "factory")
    private List<Product> products;

    @OneToMany(mappedBy = "factory")
    private List<FactoryImage> factoryImages;
}
