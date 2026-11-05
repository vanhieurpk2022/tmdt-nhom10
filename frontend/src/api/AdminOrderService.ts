import api from "./api";
import type { ApiResponse } from "./api";
import type { OrderStatus } from "../enums/OrderStatus";
import type { PaymentMethod, OrderResponse } from "./OrderService";
import type { ProductType } from "../enums/ProductType";

type PaymentStatus = NonNullable<OrderResponse["paymentStatus"]>;

export interface AdminOrderListItem {
    id: number;
    code: string;
    userId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productSummary: string;
    productType: ProductType;
    factoryId?: number;
    factoryName?: string;
    itemCount: number;
    totalPrice: number;
    shippingFee: number;
    discountAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    recipientName: string;
    phoneNumber: string;
    shippingAddress: string;
    createdAt: string;
    deliveredAt?: string;
}

export interface AdminOrderPageResult {
    content: AdminOrderListItem[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}

export interface AdminOrderStats {
    totalOrders: number;
    pendingCount: number;
    processingCount: number;
    deliveringCount: number;
    deliveredCount: number;
    cancelledCount: number;
    totalRevenue: number;
}

export interface AdminOrderDetail {
    id: number;
    code: string;
    createdAt: string;
    deliveredAt?: string;
    expectedDeliveryAt?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    subtotalPrice: number;
    shippingFee: number;
    discountAmount: number;
    totalPrice: number;
    note?: string;
    cancelReason?: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    recipient: {
        name: string;
        phone: string;
        address: string;
    };
    items: Array<{
        id: number;
        productId: number;
        productName: string;
        productImage?: string;
        productType: ProductType;
        scentTier?: number;
        volumeMl?: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        factoryId?: number;
        factoryName?: string;
        factoryPhone?: string;
        factoryAddress?: string;
    }>;
    vouchers?: string[];
    refunds?: Array<{
        id: number;
        orderId?: number;
        reason?: string;
        status?: string;
        amount?: number;
        createdAt?: string;
    }>;
}

export const AdminOrderService = {
    // 1. Lấy danh sách đơn hàng toàn sàn với bộ lọc nâng cao
    getOrders: async (
        page: number = 0,
        size: number = 10,
        search?: string,
        status?: OrderStatus | string,
        factoryId?: number | string,
        productType?: ProductType | string,
        paymentStatus?: PaymentStatus | string,
        sortBy: string = "createdAt",
        sortDir: string = "desc"
    ): Promise<AdminOrderPageResult> => {
        const params: Record<string, any> = { page, size, sortBy, sortDir };
        if (search && search.trim()) params.search = search.trim();
        if (status && status !== "ALL" && status !== "Tất cả") params.status = status;
        if (factoryId && factoryId !== "ALL") params.factoryId = factoryId;
        if (productType && productType !== "ALL") params.productType = productType;
        if (paymentStatus && paymentStatus !== "ALL") params.paymentStatus = paymentStatus;

        const res = await api.get<ApiResponse<AdminOrderPageResult>>("/admin/orders", { params });
        return res.data.data;
    },

    // 2. Thống kê đơn hàng
    getOrderStats: async (): Promise<AdminOrderStats> => {
        const res = await api.get<ApiResponse<AdminOrderStats>>("/admin/orders/stats");
        return res.data.data;
    },

    // 3. Chi tiết 1 đơn hàng
    getOrderDetail: async (id: number): Promise<AdminOrderDetail> => {
        const res = await api.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}`);
        return res.data.data;
    },

    // 4. Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (
        id: number,
        status: OrderStatus | string,
        note?: string,
        cancelReason?: string
    ): Promise<AdminOrderDetail> => {
        const res = await api.patch<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}/status`, {
            status,
            note,
            cancelReason,
        });
        return res.data.data;
    },

    // 5. Xóa / Hủy đơn hàng
    deleteOrder: async (id: number): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/admin/orders/${id}`);
    },
};
