export type OrderStatus = "processing" | "shipping" | "completed" | "cancelled";

export interface OrderHistoryProduct {
    id: number;
    name: string;
    variant: string;
    image: string;
    quantity: number;
    price: number;
}

export interface OrderHistoryItem {
    detailUrl?: string;
    id: string;
    code: string;
    createdAt: string;
    status: OrderStatus;
    statusLabel?: string;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: string;
    products: OrderHistoryProduct[];
    total: number;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
    processing: "Đang xử lý",
    shipping: "Đang giao",
    completed: "Đã giao",
    cancelled: "Đã hủy",
};
