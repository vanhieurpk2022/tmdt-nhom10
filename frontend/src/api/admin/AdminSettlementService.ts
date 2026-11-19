import api from "../api";

export interface AdminSettlementOverview {
    totalDeliveredGrossSales: number;
    defaultFeeRate: number;
    totalPlatformFee: number;
    totalNetPayable: number;
    totalDisbursed: number;
    totalPendingDisbursement: number;
    totalFactories: number;
    factoriesWithPendingPayout: number;
}

export interface FactorySettlementSummary {
    factoryId: number;
    factoryName: string;
    shopPhone: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    deliveredOrdersCount: number;
    pendingOrdersCount: number;
    grossSales: number;
    platformFeeRate: number;
    platformFee: number;
    netPayable: number;
    disbursedAmount: number;
    remainingAmount: number;
    status: "PENDING" | "PARTIAL" | "COMPLETED" | "NONE" | string;
}

export interface OrderItemDetail {
    productName: string;
    mil?: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface FactoryOrderSettlement {
    orderId: number;
    recipientName: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    deliveredAt?: string;
    orderGross: number;
    platformFee: number;
    netAmount: number;
    isSettled?: boolean;
    settlementStatus?: "DISBURSED" | "PENDING" | string;
    items: OrderItemDetail[];
}

export interface DisbursementRequest {
    factoryId: number;
    amount: number;
    feeRate?: number;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    transactionCode?: string;
    note?: string;
}

export interface SettlementHistoryItem {
    id: number;
    factoryId: number;
    factoryName: string;
    amount: number;
    grossSales: number;
    platformFee: number;
    platformFeeRate: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transactionCode: string;
    note: string;
    status: string;
    disbursedBy: string;
    disbursedAt: string;
}

export const AdminSettlementService = {
    getOverview: async (feeRate?: number): Promise<AdminSettlementOverview> => {
        const res = await api.get<any>("/admin/settlements/overview", {
            params: feeRate !== undefined ? { feeRate } : {},
        });
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    getFactorySummaries: async (feeRate?: number): Promise<FactorySettlementSummary[]> => {
        const res = await api.get<any>("/admin/settlements/factories", {
            params: feeRate !== undefined ? { feeRate } : {},
        });
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    getFactoryOrders: async (factoryId: number, feeRate?: number): Promise<FactoryOrderSettlement[]> => {
        const res = await api.get<any>(`/admin/settlements/factories/${factoryId}/orders`, {
            params: feeRate !== undefined ? { feeRate } : {},
        });
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    disburse: async (payload: DisbursementRequest): Promise<SettlementHistoryItem> => {
        const res = await api.post<any>("/admin/settlements/disburse", payload);
        return res.data?.data !== undefined ? res.data.data : res.data;
    },

    getHistory: async (): Promise<SettlementHistoryItem[]> => {
        const res = await api.get<any>("/admin/settlements/history");
        return res.data?.data !== undefined ? res.data.data : res.data;
    },
};

