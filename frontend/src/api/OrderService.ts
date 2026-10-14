import type { CartItem } from "../data/cartData";
import { fallbackCartImage } from "../data/cartData";
import api from "./api";

export type PaymentMethod = "COD" | "MOMO" | "BANK_CARD" | "BANK_TRANSFER";

export interface CreateOrderRequest {
    addressId: number;
    cartItemIds: number[];
    paymentMethod: PaymentMethod;
    note?: string;
}

export interface OrderItemResponse {
    id: number;
    productId: number;
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
    discountAmount: number;
    shippingFee: number;
    totalPrice: number;
    createdAt: string;
    items: OrderItemResponse[];
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export const lastOrderStorageKey = "oilia_last_order";

export function formatOrderCode(orderId: number) {
    return `OLIA-${String(orderId).padStart(8, "0")}`;
}

export function getPaymentMethodLabel(paymentMethod?: PaymentMethod) {
    const labels: Record<PaymentMethod, string> = {
        COD: "Thanh toán khi nhận hàng",
        MOMO: "Ví MoMo",
        BANK_CARD: "Thẻ ngân hàng",
        BANK_TRANSFER: "Chuyển khoản QR",
    };

    return paymentMethod ? labels[paymentMethod] : "Ví MoMo";
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
        variant: "Sản phẩm tinh dầu",
        origin: "Đã đặt hàng",
        factoryName: item.factoryName || "Oilia Essential",
        factoryCode: `SP-${item.productId}`,
        price: item.unitPrice,
        basePrice: item.unitPrice,
        quantity: item.quantity,
        selected: true,
        image: item.thumbnailUrl || fallbackCartImage,
        inStock: true,
        stockQuantity: item.quantity,
        stockStatus: "Còn hàng",
    }));
}

export const orderService = {
    createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
        const res = await api.post<ApiResponse<OrderResponse>>("/orders", request);
        return res.data.data;
    },
};
