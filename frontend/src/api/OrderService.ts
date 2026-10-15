import type { CartItem } from "../data/cartData";
import { fallbackCartImage } from "../data/cartData";
import api from "./api";
import type { BuyNowSelection } from "./CheckoutSelection";
import type { CartItemResponse } from "./CartService";

export type PaymentMethod = "COD" | "VNPAY";

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
        VNPAY: "Thanh toán qua VNPay",
    };

    return paymentMethod ? labels[paymentMethod] : "Thanh toán khi nhận hàng";
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
    previewBuyNow: async (selection: BuyNowSelection): Promise<CartItemResponse> => {
        const res = await api.post<ApiResponse<CartItemResponse>>("/orders/buy-now/preview", selection);
        return res.data.data;
    },

    createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
        const res = await api.post<ApiResponse<OrderResponse>>("/orders", request);
        return res.data.data;
    },
};
