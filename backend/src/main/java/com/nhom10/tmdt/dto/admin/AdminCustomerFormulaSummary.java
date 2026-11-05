package com.nhom10.tmdt.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerFormulaSummary {
    private Long id;
    private String code;
    private String name;
    private String bottleType;
    private String labelDesign;
    private Double totalVolumeMl;
    private Double price;
    private Long factoryId;
    private String factoryName;
    private String notes;
    private Integer orderedCount;
    private LocalDateTime createdAt;

    private String topNotes;
    private String heartNotes;
    private String baseNotes;

    private List<FormulaItemSummary> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FormulaItemSummary {
        private Long id;
        private Long productId;
        private String productName;
        private Integer tier;
        private Double percentage;
        private Double volumeMl;
    }
}
