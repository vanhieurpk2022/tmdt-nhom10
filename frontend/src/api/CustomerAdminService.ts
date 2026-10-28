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
    cskhNote?: string;
    storeCredit?: number;
    loyaltyPoints?: number;
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
    disputes?: Array<{
        id: number;
        orderId?: number;
        reason?: string;
        status?: string;
        amount?: number;
        createdAt?: string;
        processedAt?: string;
    }>;
    formulas?: CustomerFormulaItem[];
}

export interface CustomerFormulaItem {
    id: number;
    code: string;
    name: string;
    bottleType?: string;
    labelDesign?: string;
    totalVolumeMl?: number;
    price?: number;
    factoryId?: number;
    factoryName?: string;
    notes?: string;
    orderedCount?: number;
    createdAt?: string;
    topNotes?: string;
    heartNotes?: string;
    baseNotes?: string;
    items?: Array<{
        id: number;
        productId?: number;
        productName?: string;
        tier?: number;
        percentage?: number;
        volumeMl?: number;
    }>;
}

interface AdminCustomerRaw {
    id: number;
    name: string;
    fullname?: string;
    username?: string;
    email: string;
    phone?: string;
    birthday?: string;
    gender?: string;
    avatarUrl?: string;
    statusCode: "ACTIVE" | "BANNED" | "INACTIVE";
    status: string;
    emailVerified?: boolean;
    createdAt?: string;
    roles?: string[];
    tier: string;
    orders: number | string;
    ltv: number;
    formulas?: number;
    formulaNote?: string;
    recent?: string;
    recentNote?: string;
    initials?: string;
    avatarTone?: string;
    risk?: boolean;
    cskhNote?: string;
    storeCredit?: number;
    loyaltyPoints?: number;
}

function mapRaw(raw: AdminCustomerRaw): CustomerItem {
    const displayName = raw.name || raw.fullname || raw.username || raw.email || "Khách hàng";
    const initials = raw.initials || computeInitials(displayName);
    const tones = ["pink", "blue", "slate", "mint"];
    const avatarTone = raw.avatarTone || tones[Math.abs(Number(raw.id) % tones.length)];

    return {
        id: raw.id,
        name: displayName,
        fullname: raw.fullname,
        username: raw.username,
        email: raw.email || "",
        phone: raw.phone || "",
        birthday: raw.birthday,
        gender: raw.gender,
        avatarUrl: raw.avatarUrl,
        statusCode: raw.statusCode || "ACTIVE",
        status: raw.status || "Hoạt động",
        emailVerified: raw.emailVerified ?? false,
        createdAt: raw.createdAt,
        roles: raw.roles,
        tier: raw.tier || "Vãng lai",
        orders: Number(raw.orders) || 0,
        ltv: raw.ltv || 0,
        formulas: raw.formulas || 0,
        formulaNote: raw.formulaNote || "",
        recent: raw.recent || "",
        recentNote: raw.recentNote || "",
        initials,
        avatarTone,
        risk: raw.risk ?? raw.statusCode === "BANNED",
        cskhNote: raw.cskhNote,
        storeCredit: raw.storeCredit ?? 0,
        loyaltyPoints: raw.loyaltyPoints ?? Math.round((raw.ltv || 0) / 10000),
    };
}

function computeInitials(name: string): string {
    if (!name?.trim()) return "KH";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface AdminPageRaw {
    content: AdminCustomerRaw[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast?: boolean;
    last?: boolean;
}

interface AdminStatsRaw {
    totalCustomers: number;
    activeCustomers: number;
    bannedCustomers: number;
    inactiveCustomers: number;
    totalRevenue: number;
}

interface AdminDetailRaw {
    customer: AdminCustomerRaw;
    addresses: CustomerDetail["addresses"];
    recentOrders: CustomerDetail["recentOrders"];
    disputes?: CustomerDetail["disputes"];
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
    }): Promise<CustomerPageResult> => {
        const res = await api.get<ApiResponse<AdminPageRaw>>("/admin/customers", { params });
        const raw = res.data.data;
        return {
            content: (raw.content || []).map(mapRaw),
            pageNo: raw.pageNo,
            pageSize: raw.pageSize,
            totalElements: raw.totalElements,
            totalPages: raw.totalPages,
            isLast: raw.isLast ?? raw.last ?? false,
        };
    },

    getStats: async (): Promise<CustomerStats> => {
        const res = await api.get<ApiResponse<AdminStatsRaw>>("/admin/customers/stats");
        const raw = res.data.data;
        return {
            totalCustomers: raw.totalCustomers || 0,
            activeCustomers: raw.activeCustomers || 0,
            bannedCustomers: raw.bannedCustomers || 0,
            inactiveCustomers: raw.inactiveCustomers || 0,
            totalRevenue: raw.totalRevenue || 0,
        };
    },

    getDetail: async (id: number | string): Promise<CustomerDetail> => {
        const res = await api.get<ApiResponse<AdminDetailRaw>>(`/admin/customers/${id}`);
        const raw = res.data.data;
        return {
            customer: mapRaw(raw.customer),
            addresses: raw.addresses || [],
            recentOrders: raw.recentOrders || [],
            disputes: raw.disputes || [],
        };
    },

    updateStatus: async (id: number | string, status: "ACTIVE" | "BANNED" | "INACTIVE"): Promise<CustomerItem> => {
        const res = await api.put<ApiResponse<AdminCustomerRaw>>(`/admin/customers/${id}/status`, { status });
        return mapRaw(res.data.data);
    },

    updateRoles: async (id: number | string, roleNames: string[]): Promise<CustomerItem> => {
        const res = await api.put<ApiResponse<AdminCustomerRaw>>(`/admin/customers/${id}/roles`, { roleNames });
        return mapRaw(res.data.data);
    },

    updateInfo: async (
        id: number | string,
        data: { fullname?: string; phone?: string; birthday?: string; gender?: string; cskhNote?: string }
    ): Promise<CustomerItem> => {
        const res = await api.put<ApiResponse<AdminCustomerRaw>>(`/admin/customers/${id}`, data);
        return mapRaw(res.data.data);
    },

    updateStoreCredit: async (id: number | string, amount: number): Promise<CustomerItem> => {
        const res = await api.put<ApiResponse<AdminCustomerRaw>>(`/admin/customers/${id}/credit`, { amount });
        return mapRaw(res.data.data);
    },

    resetPassword: async (id: number | string): Promise<string> => {
        const res = await api.post<ApiResponse<string>>(`/admin/customers/${id}/reset-password`);
        return res.data.data || res.data.message || "Password123@";
    },

    deleteCustomer: async (id: number | string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/admin/customers/${id}`);
    },
};