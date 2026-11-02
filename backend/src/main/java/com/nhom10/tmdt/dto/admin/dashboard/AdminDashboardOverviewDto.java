package com.nhom10.tmdt.dto.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardOverviewDto {
    // Doanh thu
    private double totalRevenue;             
    private double settledRevenue;          
    private double pendingSettlementRevenue; 

    // Đơn hàng
    private long totalOrders;              
    private long pendingOrders;             
    private long processingOrders;          
    private long shippingOrders;             
    private long deliveredOrders;            
    private long cancelledOrders;             
    private double deliverySuccessRate;       
    private double cancellationRate;        

    // KPI Đối tác Xưởng & Người dùng
    private long activeWorkshops;           
    private long pendingWorkshops;          
    private long totalCustomers;             
    private long totalProducts;               

    // KPI Vận hành & Chất lượng
    private double averageRating;         
    private long totalReviews;                
    private long openDisputes;                
}

