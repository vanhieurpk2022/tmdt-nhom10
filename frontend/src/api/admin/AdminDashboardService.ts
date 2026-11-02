import api, { type ApiResponse } from "../api";

export interface AdminDashboardOverview {
    totalRevenue: number;
    settledRevenue: number;
    pendingSettlementRevenue: number;
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

export interface AdminBarChartResponse {
    fromDate: string;
    toDate: string;
    groupBy: "DAY" | "MONTH";
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
    groupBy?: "DAY" | "MONTH" | string;
}

export const AdminDashboardService = {
    /**
     * Lấy các chỉ số KPI tóm tắt đầu trang tổng quan
     */
    getOverview: async (): Promise<AdminDashboardOverview> => {
        const res = await api.get<any>("/admin/dashboard/overview");
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    /**
     * Lấy dữ liệu biểu đồ cột theo thời gian
     */
    getBarChart: async (params?: BarChartQueryParams): Promise<AdminBarChartResponse> => {
        const res = await api.get<any>("/admin/dashboard/bar-chart", {
            params,
        });
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    /**
     * Lấy dữ liệu các biểu đồ tròn (Trạng thái đơn, Danh mục, Loại sản phẩm, Lý do hủy, v.v.)
     */
    getPieCharts: async (): Promise<AdminPieChartData> => {
        const res = await api.get<any>("/admin/dashboard/pie-charts");
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    /**
     * Lấy trọn bộ dữ liệu trang tổng quan (KPIs + Biểu đồ cột + Các biểu đồ tròn) trong 1 request
     */
    getFullDashboard: async (params?: BarChartQueryParams): Promise<AdminDashboardFullResponse> => {
        const res = await api.get<any>("/admin/dashboard/full", {
            params,
        });
        return res.data?.data !== undefined ? res.data.data : res.data;
    },
};

