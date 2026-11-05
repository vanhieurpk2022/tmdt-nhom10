import type { CartItem } from "../data/cartData";
import { fallbackCartImage } from "../data/cartData";
import api, { type ApiResponse } from "./api";
import type { BuyNowSelection } from "./CheckoutSelection";
import type { CartItemResponse, CartResponse } from "./CartService";
import type { CustomerRefund } from "./RefundService";
import type { PendingCheckout } from "./CheckoutSession";
import type { OrderStatus } from "../data/orderHistoryData";

export type PaymentMethod = "COD" | "VNPAY";
export type CancelReason = "CUSTOMER_CHANGED_MIND" | "OUT_OF_STOCK" | "DELIVERY_TIME_CONFLICT" | "FACTORY_CONFIRM_LATE";

export interface CancelOrderRequest {
    reason: CancelReason;
    note?: string;
}

export interface CreateOrderRequest {
    addressId: number;
    cartItemIds?: number[];
    buyNow?: BuyNowSelection;
    paymentMethod: PaymentMethod;
    note?: string;
}

export interface OrderItemResponse {
    id: number;
    productId: number;
    productMilId?: number | null;
    mil?: number | null;
    productName: string;
    factoryName: string | null;
    thumbnailUrl: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface OrderResponse {
    id: number;
    status: string;
    paymentMethod: PaymentMethod;
    recipientName: string;
    phoneNumber: string;
    shippingAddress: string;
    note: string | null;
    subtotalPrice: number;
    shippingFee: number;
    totalPrice: number;
    createdAt: string;
    items: OrderItemResponse[];
    paymentStatus?: "PENDING" | "FAILED" | "PAID" | "REFUND_PENDING" | "REFUNDED";
    cancelReason: CancelReason | null;
    cancelledAt: string | null;
    cancellationNote: string | null;
}

export interface PaymentResponse {
    order: OrderResponse;
    txnRef: string;
    paymentUrl: string | null;
    expiresAt: string;
}

export interface PaymentAvailability {
    available: boolean;
    message: string;
}

export interface PaymentStatusResponse {
    orderId: number;
    orderStatus: string;
    paymentStatus: NonNullable<OrderResponse["paymentStatus"]>;
    attemptStatus: string | null;
    canRetry: boolean;
    needsReview: boolean;
    reservationExpiresAt: string;
    txnRef: string | null;
}

export interface OrderHistorySummary {
    totalOrders: number;
    deliveredOrders: number;
    totalSpent: number;
}

export interface OrderHistoryResponse {
    orders: OrderResponse[];
    page: number;
    totalPages: number;
    totalElements: number;
    statusCounts: Record<"all" | OrderStatus, number>;
    summary: OrderHistorySummary;
}

export interface CheckoutResult {
    order: OrderResponse;
    payment: PaymentResponse | null;
}

const paymentHeaders = { "X-Requested-With": "XMLHttpRequest" };

export const lastOrderStorageKey = "oilia_last_order";

export function formatOrderCode(orderId: number) {
    return `OLIA-${String(orderId).padStart(8, "0")}`;
}

export function getPaymentMethodLabel(paymentMethod?: PaymentMethod) {
    const labels: Record<PaymentMethod, string> = {
        COD: "Thanh toán khi nhận hàng",
        VNPAY: "Thanh toán qua VNPay",
    };

    return paymentMethod ? labels[paymentMethod] : "Thanh toán khi nhận hàng";
}

export function getPaymentStatusLabel(order: Pick<OrderResponse, "status" | "paymentMethod" | "paymentStatus">) {
    if (order.status === "CANCELLED" && (!order.paymentStatus || ["PENDING", "FAILED"].includes(order.paymentStatus))) {
        return "Đã hủy · chưa ghi nhận thanh toán";
    }
    if (order.paymentMethod === "COD" && (!order.paymentStatus || order.paymentStatus === "PENDING")) {
        return order.status === "DELIVERED" ? "Đã thanh toán khi nhận hàng" : "Thanh toán khi nhận hàng";
    }
    const labels = {
        PENDING: "Chờ thanh toán", FAILED: "Thanh toán chưa thành công", PAID: "Đã thanh toán",
        REFUND_PENDING: "Chờ xử lý hoàn tiền / đối soát", REFUNDED: "Đã hoàn tiền",
    };
    return labels[order.paymentStatus ?? "PENDING"];
}

export function saveLastOrder(order: OrderResponse) {
    window.sessionStorage.setItem(lastOrderStorageKey, JSON.stringify(order));
}

export function getLastOrder() {
    const rawValue = window.sessionStorage.getItem(lastOrderStorageKey);
    if (!rawValue) return null;

    try {
        return JSON.parse(rawValue) as OrderResponse;
    } catch {
        return null;
    }
}

export function toCartItemsFromOrder(order: OrderResponse): CartItem[] {
    return order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        variant: item.mil ? `Dung tích: ${item.mil}ml` : "Sản phẩm tinh dầu",
        origin: "Đã đặt hàng",
        factoryName: item.factoryName || "Oilia Essential",
        factoryCode: `SP-${item.productId}`,
        price: item.unitPrice,
        quantity: item.quantity,
        selected: true,
        image: item.thumbnailUrl || fallbackCartImage,
        inStock: true,
        stockQuantity: item.quantity,
        stockStatus: "Còn hàng",
    }));
}

export const orderService = {
    vnpayAvailability: async (): Promise<PaymentAvailability> => {
        const res = await api.get<ApiResponse<PaymentAvailability>>("/payments/vnpay/availability");
        return res.data.data;
    },
    listOrders: async (page = 0, status = "all", search = ""): Promise<OrderHistoryResponse> => {
        const res = await api.get<ApiResponse<OrderHistoryResponse>>("/orders", { params: { page, status, search } });
        return res.data.data;
    },
    recoverCheckout: async (key: string): Promise<OrderResponse> => {
        const res = await api.get<ApiResponse<OrderResponse>>("/orders/checkout-status", { params: { key } });
        return res.data.data;
    },
    recoverVnpay: async (key: string): Promise<PaymentResponse> => {
        const res = await api.get<ApiResponse<PaymentResponse>>("/payments/vnpay/checkout-status", { params: { key } });
        return res.data.data;
    },
    paymentStatus: async (id: number): Promise<PaymentStatusResponse> => {
        const res = await api.get<ApiResponse<PaymentStatusResponse>>(`/orders/${id}/payment-status`);
        return res.data.data;
    },
    getOrder: async (id: number): Promise<OrderResponse> => {
        const res = await api.get<ApiResponse<OrderResponse>>(`/orders/${id}`);
        return res.data.data;
    },

    getRefunds: async (id: number): Promise<CustomerRefund[]> => {
        const res = await api.get<ApiResponse<CustomerRefund[]>>(`/orders/${id}/refunds`);
        return res.data.data;
    },

    cancelOrder: async (id: number, request: CancelOrderRequest): Promise<OrderResponse> => {
        const res = await api.post<ApiResponse<OrderResponse>>(`/orders/${id}/cancel`, request, { headers: paymentHeaders });
        return res.data.data;
    },

    reorder: async (id: number): Promise<CartResponse> => {
        const res = await api.post<ApiResponse<CartResponse>>(`/orders/${id}/reorder`, {}, { headers: paymentHeaders });
        return res.data.data;
    },

    checkoutVnpay: async (request: CreateOrderRequest, key: string): Promise<PaymentResponse> => {
        const res = await api.post<ApiResponse<PaymentResponse>>("/payments/vnpay/checkout", request, {
            headers: { ...paymentHeaders, "Idempotency-Key": key },
        });
        return res.data.data;
    },

    vnpayStatus: async (ref: string): Promise<PaymentStatusResponse> => {
        const res = await api.get<ApiResponse<PaymentStatusResponse>>("/payments/vnpay/status", { params: { ref } });
        return res.data.data;
    },

    retryVnpay: async (orderId: number, key: string): Promise<PaymentResponse> => {
        const res = await api.post<ApiResponse<PaymentResponse>>(`/payments/vnpay/orders/${orderId}/retry`, {}, {
            headers: { ...paymentHeaders, "Idempotency-Key": key },
        });
        return res.data.data;
    },
    previewBuyNow: async (selection: BuyNowSelection): Promise<CartItemResponse> => {
        const res = await api.post<ApiResponse<CartItemResponse>>("/orders/buy-now/preview", selection);
        return res.data.data;
    },

    createOrder: async (request: CreateOrderRequest, key: string): Promise<OrderResponse> => {
        const res = await api.post<ApiResponse<OrderResponse>>("/orders", request, {
            headers: { ...paymentHeaders, "Idempotency-Key": key },
        });
        return res.data.data;
    },

    submitCheckout: async ({ request, key }: PendingCheckout): Promise<CheckoutResult> => {
        if (request.paymentMethod === "VNPAY") {
            const payment = await orderService.checkoutVnpay(request, key);
            return { order: payment.order, payment };
        }
        return { order: await orderService.createOrder(request, key), payment: null };
    },

    resumeCheckout: async (pending: PendingCheckout): Promise<CheckoutResult> => {
        let order: OrderResponse;
        try {
            order = await orderService.recoverCheckout(pending.key);
        } catch (error) {
            if ((error as { response?: { status?: number } }).response?.status !== 404) throw error;
            // Replaying the same key is safe even if the original transaction is still committing.
            return orderService.submitCheckout(pending);
        }
        if (order.paymentMethod === "VNPAY") {
            const payment = await orderService.recoverVnpay(pending.key);
            return { order, payment };
        }
        return { order, payment: null };
    },
};
