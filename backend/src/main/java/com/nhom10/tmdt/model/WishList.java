package com.nhom10.tmdt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name="wish-list")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishList {
    @Id
    private Long id;

    @Column(name="update_at")
    private LocalDateTime updateAt;

    // private ProductCustom productCustom
    // private Product product
    // private User user;

}
