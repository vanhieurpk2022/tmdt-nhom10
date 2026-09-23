package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.SaleStatus;
import jakarta.persistence.*;
import org.springframework.cglib.core.Local;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name="sales")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sales {
    @Id
    private Long id;
    private String name;
    private String description;
    @Column(name ="discount_rate" )
    private double discountRate;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name="end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private SaleStatus status;

    // private Product product;
}
