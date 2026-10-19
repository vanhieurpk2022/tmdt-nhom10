import api from "./api";
import type { ApiResponse } from "./api";

export interface CustomerItem {
    id: number | string;
    name: string;
    fullname?: string;
    username?: string;
    email: string;
    phone: string;
    birthday?: string;
    gender?: string;
    avatarUrl?: string;
    statusCode: "ACTIVE" | "BANNED" | "INACTIVE";
    status: string;
    emailVerified: boolean;
    createdAt?: string;
    roles?: string[];
    tier: string;
    orders: number;
    ltv: number;
    formulas: number;
    formulaNote: string;
    recent: string;
    recentNote: string;
    initials: string;
    avatarTone: string;
    risk?: boolean;
}

export interface CustomerPageResult {
    content: CustomerItem[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}

export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    bannedCustomers: number;
    inactiveCustomers: number;
    totalRevenue: number;
}

export interface CustomerDetail {
    customer: CustomerItem;
    addresses: Array<{
        id: number;
        recipentName: string;
        phoneNumber: string;
        street: string;
        ward: string;
        district: string;
        city: string;
        isDefault: boolean;
    }>;
    recentOrders: Array<{
        id: number;
        createdAt: string;
        totalPrice: number;
        status: string;
        recipientName: string;
        shippingAddress: string;
        itemCount: number;
    }>;
}

export const CustomerAdminService = {
    getCustomers: async (params?: {
        page?: number;
        size?: number;
        search?: string;
        status?: string;
        role?: string;
        sortBy?: string;
        sortDir?: string;
    }) => {
        const res = await api.get<ApiResponse<CustomerPageResult>>("/admin/customers", { params });
        return res.data.data;
    },

    getStats: async () => {
        const res = await api.get<ApiResponse<CustomerStats>>("/admin/customers/stats");
        return res.data.data;
    },

    getDetail: async (id: number | string) => {
        const res = await api.get<ApiResponse<CustomerDetail>>(`/admin/customers/${id}`);
        return res.data.data;
    },

    updateStatus: async (id: number | string, status: "ACTIVE" | "BANNED" | "INACTIVE") => {
        const res = await api.put<ApiResponse<CustomerItem>>(`/admin/customers/${id}/status`, { status });
        return res.data.data;
    },

    updateRoles: async (id: number | string, roleNames: string[]) => {
        const res = await api.put<ApiResponse<CustomerItem>>(`/admin/customers/${id}/roles`, { roleNames });
        return res.data.data;
    },

    updateInfo: async (id: number | string, data: { fullname?: string; phone?: string; birthday?: string; gender?: string }) => {
        const res = await api.put<ApiResponse<CustomerItem>>(`/admin/customers/${id}`, data);
        return res.data.data;
    },

    deleteCustomer: async (id: number | string) => {
        const res = await api.delete<ApiResponse<void>>(`/admin/customers/${id}`);
        return res.data.data;
    }
};