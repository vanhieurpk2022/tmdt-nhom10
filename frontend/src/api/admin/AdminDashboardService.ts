import type { ApiResponse } from "../api";
import api from "../api";

export interface AdminDashboardOverview {
    totalRevenue: number;              // Tổng giá trị giao dịch hàng hóa (GMV)
    actualPlatformRevenue?: number;    // Doanh thu thực tế nhận được của sàn (Phí sàn thu được)
    settledRevenue: number;            // Tiền đã giải ngân cho xưởng
    pendingSettlementRevenue: number;  // Tiền đang giữ chờ giải ngân cho xưởng
    totalDeliveredGross?: number;      // Tiền hàng các đơn hoàn tất
    platformFeeRate?: number;          // Tỷ lệ phí sàn (0.08)
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    deliverySuccessRate: number;
    cancellationRate: number;
    activeWorkshops: number;
    pendingWorkshops: number;
    totalCustomers: number;
    totalProducts: number;
    averageRating: number;
    totalReviews: number;
    openDisputes: number;
}

export interface AdminBarChartItem {
    date: string;
    label: string;
    revenue: number;
    orderCount: number;
    totalQuantity: number;
    completedOrders: number;
    cancelledOrders: number;
    customRevenue: number;
    normalRevenue: number;
}

export type AdminChartGrouping = "HOUR" | "DAY" | "MONTH" | "YEAR";

export interface AdminBarChartResponse {
    fromDate: string;
    toDate: string;
    groupBy: AdminChartGrouping;
    totalPeriodRevenue: number;
    totalPeriodOrders: number;
    totalPeriodQuantity: number;
    items: AdminBarChartItem[];
}

export interface AdminPieSlice {
    key: string;
    label: string;
    count: number;
    amount?: number;
    percentage: number;
    color: string;
}

export interface AdminPieChartData {
    orderStatusDistribution: AdminPieSlice[];
    categoryDistribution: AdminPieSlice[];
    productTypeDistribution: AdminPieSlice[];
    cancelReasonDistribution: AdminPieSlice[];
    paymentMethodDistribution: AdminPieSlice[];
    topWorkshopsDistribution: AdminPieSlice[];
}

export interface AdminDashboardFullResponse {
    overview: AdminDashboardOverview;
    barChart: AdminBarChartResponse;
    pieCharts: AdminPieChartData;
}

export interface BarChartQueryParams {
    from?: string;
    to?: string;
    period?: "7days" | "30days" | "90days" | "year" | "all" | string;
    groupBy?: AdminChartGrouping | "AUTO";
}

export const AdminDashboardService = {
    /**
     * Lấy các chỉ số KPI tóm tắt đầu trang tổng quan
     */
    getOverview: async (): Promise<AdminDashboardOverview> => {
        const res = await api.get<ApiResponse<AdminDashboardOverview>>("/admin/dashboard/overview");
        return res.data.data;
    },

    /**
     * Lấy dữ liệu biểu đồ cột theo thời gian
     */
    getBarChart: async (params?: BarChartQueryParams, signal?: AbortSignal): Promise<AdminBarChartResponse> => {
        const res = await api.get<ApiResponse<AdminBarChartResponse>>("/admin/dashboard/bar-chart", {
            params,
            signal,
        });
        return res.data.data;
    },

    /**
     * Lấy dữ liệu các biểu đồ tròn (Trạng thái đơn, Danh mục, Loại sản phẩm, Lý do hủy, v.v.)
     */
    getPieCharts: async (): Promise<AdminPieChartData> => {
        const res = await api.get<ApiResponse<AdminPieChartData>>("/admin/dashboard/pie-charts");
        return res.data.data;
    },

    /**
     * Lấy trọn bộ dữ liệu trang tổng quan (KPIs + Biểu đồ cột + Các biểu đồ tròn) trong 1 request
     */
    getFullDashboard: async (params?: BarChartQueryParams): Promise<AdminDashboardFullResponse> => {
        const res = await api.get<ApiResponse<AdminDashboardFullResponse>>("/admin/dashboard/full", {
            params,
        });
        return res.data.data;
    },
};

