import api from "./api";
import type { RefundStatus } from "../enums/RefundStatus";
import type { OrderStatus } from "../enums/OrderStatus";

export interface CustomerRefund {
    id: number;
    amountVnd: number;
    reason: string;
    status: RefundStatus;
    createdAt: string;
    processedAt: string | null;
}

export interface RefundSummary extends CustomerRefund {
    orderId: number;
    recipientName: string;
    phoneNumber: string;
    orderStatus: OrderStatus;
    cancelledAt: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    processedBy: string | null;
    note: string | null;
}

export type RefundAction = "approve" | "reject" | "succeed" | "fail";
const headers = { "X-Requested-With": "XMLHttpRequest" };
const baseUrl = "/admin/payments/refunds";

export const refundService = {
    list: async (status: RefundStatus | undefined, page: number, orderId?: number): Promise<RefundSummary[]> => {
        return (await api.get<RefundSummary[]>(baseUrl, { params: { status, page, orderId } })).data;
    },
    get: async (id: number): Promise<RefundSummary> => {
        return (await api.get<RefundSummary>(`${baseUrl}/${id}`)).data;
    },
    act: async (id: number, action: RefundAction, note: string): Promise<RefundSummary> => {
        const completion = action === "succeed" || action === "fail";
        const body = completion ? { succeeded: action === "succeed", note } : { note };
        return (await api.post<RefundSummary>(`${baseUrl}/${id}/${completion ? "complete" : action}`, body, { headers })).data;
    },
};
