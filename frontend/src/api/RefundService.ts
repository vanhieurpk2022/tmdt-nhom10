import api from "./api";
import type { RefundStatus } from "../enums/RefundStatus";

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
    paymentAttemptId: number | null;
    providerRequestId: string | null;
    providerTransactionNo: string | null;
    providerResponseCode: string | null;
    providerTransactionStatus: string | null;
    lastError: string | null;
}

export type RefundAction = "approve" | "reject" | "process" | "refresh" | "reconcile";

export interface RefundReconciliation {
    providerRequestId: string;
    status: "SUCCEEDED" | "FAILED";
    transactionNo: string;
    evidence: string;
}

const headers = { "X-Requested-With": "XMLHttpRequest" };
const baseUrl = "/admin/payments/refunds";

export const refundService = {
    list: async (status: RefundStatus, page: number, orderId?: number): Promise<RefundSummary[]> => {
        const response = await api.get<RefundSummary[]>(baseUrl, { params: { status, page, orderId } });
        return response.data;
    },
    request: async (paymentAttemptId: number, reason: string, key: string): Promise<RefundSummary> => {
        const response = await api.post<RefundSummary>(baseUrl, { paymentAttemptId, reason }, {
            headers: { ...headers, "Idempotency-Key": key },
        });
        return response.data;
    },
    act: async (id: number, action: RefundAction, body?: { evidence: string } | RefundReconciliation): Promise<RefundSummary> => {
        const response = await api.post<RefundSummary>(`${baseUrl}/${id}/${action}`, body ?? {}, { headers });
        return response.data;
    },
};
