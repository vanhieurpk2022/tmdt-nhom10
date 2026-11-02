package com.nhom10.tmdt.dto.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBarChartItemDto {
    private String date;         
    private String label;         
    private double revenue;       
    private long orderCount;      
    private long totalQuantity;    
    private long completedOrders; 
    private long cancelledOrders;  
    private double customRevenue;  
    private double normalRevenue; 
}

