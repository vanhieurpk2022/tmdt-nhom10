package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.FactoryStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="factory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Factory {
    @Id
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
