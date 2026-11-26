import type { ApiResponse } from "../api";
import api from "../api";
import type { FactorySettlementSummary, FactoryOrderSettlement, SettlementHistoryItem } from "../admin/AdminSettlementService";

export const FactorySettlementService = {
    /**
     * Lấy tóm tắt tình hình giải ngân của riêng xưởng đang đăng nhập (chỉ xem)
     */
    getSummary: async (feeRate?: number): Promise<FactorySettlementSummary | null> => {
        const res = await api.get<ApiResponse<FactorySettlementSummary | null>>("/manager/settlements/summary", {
            params: { feeRate: feeRate ?? 0.08 },
        });
        return res.data.data;
    },

    /**
     * Lấy danh sách đơn hàng hoàn tất đối soát của xưởng (chỉ xem)
     */
    getOrders: async (feeRate?: number): Promise<FactoryOrderSettlement[]> => {
        const res = await api.get<ApiResponse<FactoryOrderSettlement[]>>("/manager/settlements/orders", {
            params: { feeRate: feeRate ?? 0.08 },
        });
        const list = res.data.data;
        return Array.isArray(list) ? list : [];
    },

    /**
     * Lấy lịch sử các đợt nhận tiền giải ngân từ sàn (chỉ xem)
     */
    getHistory: async (): Promise<SettlementHistoryItem[]> => {
        const res = await api.get<ApiResponse<SettlementHistoryItem[]>>("/manager/settlements/history");
        const list = res.data.data;
        return Array.isArray(list) ? list : [];
    },
};

