package com.nhom10.tmdt.dto.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPieChartDataDto {
    private List<AdminPieSliceDto> orderStatusDistribution;
    private List<AdminPieSliceDto> categoryDistribution;
    private List<AdminPieSliceDto> productTypeDistribution;
    private List<AdminPieSliceDto> cancelReasonDistribution;
    private List<AdminPieSliceDto> paymentMethodDistribution;
    private List<AdminPieSliceDto> topWorkshopsDistribution;
}

