import type { FactoryOrderDashBoard, FactoryChartOrder, FactoryOrderStatusCount, DashboardOverview } from "../../dto/factory/FactoryDashBoard";
import type { FactoryCustomRecipeDto, FactoryCustomRecipeSaveRequest, FactoryProductCreateRequest, FactoryProductEditRes, FactoryProductItem, FactoryProductMil, FactoryProductResponse, FactoryProductVariantItem } from "../../dto/factory/FactoryProductRes";
import type { ProductStatus } from "../../enums/ProductStatus";
import type { OrderStatus } from "../../enums/OrderStatus";
import type { AdminOrderListItem, AdminOrderPageResult, AdminOrderStats, AdminOrderDetail } from "../AdminOrderService";
import type { ProductImage } from "../../models/ProductImage";
import api, { type ApiResponse } from "../api";

export const FactoryServiceManager = {
    getOverview: async () => {
        const res = await api.get<ApiResponse<DashboardOverview>>(
            `/manager/dashboard/overview`
        );
        return res.data;
    },
    getUserDashBoard: async () => {
        const res = await api.get<ApiResponse<FactoryOrderDashBoard[]>>(
            `/manager/dashboard/user`
        );
        return res.data;
    },
    getChartData: async (from: string, to: string) => {
        const res = await api.get<ApiResponse<FactoryChartOrder[]>>(
            `/manager/dashboard/chart`,
            { params: { from, to } }
        );
        return res.data;
    },
    getPieData: async () => {
        const res = await api.get<ApiResponse<FactoryOrderStatusCount[]>>(
            `/manager/dashboard/pie`
        );
        return res.data;
    },
    getProducts: async () => {
        const res = await api.get<ApiResponse<FactoryProductResponse>>(
            `/manager/products`
        );
        return res.data;
    },
    createProduct: async (data: Partial<FactoryProductCreateRequest>) => {
        const res = await api.post<ApiResponse<FactoryProductCreateRequest>>(
            `/manager/products`,
            data
        );
        return res.data;
    },
    updateProduct: async (id: number, data: Partial<FactoryProductCreateRequest>) => {
        const res = await api.patch<ApiResponse<void>>(
            `/manager/products/${id}`,
            data
        );
        return res.data;
    },
    deleteProduct: async (id: number) => {
        const res = await api.delete<ApiResponse<void>>(
            `/manager/products/${id}`
        );
        return res.data;
    },
    getCustomRecipe: async (productId: number) => {
        const res = await api.get<ApiResponse<FactoryCustomRecipeDto>>(
            `/manager/products/${productId}/custom-recipe`
        );
        return res.data;
    },
    saveCustomRecipe: async (productId: number, data: FactoryCustomRecipeSaveRequest) => {
        const res = await api.put<ApiResponse<FactoryCustomRecipeDto>>(
            `/manager/products/${productId}/custom-recipe`,
            data
        );
        return res.data;
    },
    toggleStatusProduct: async (id: number, status: string) => {
        const res = await api.patch<ApiResponse<FactoryProductItem>>(
            `/manager/products/${id}/status`,
            { status }
        );
        return res.data;
    },
    changeStatusOfProduct: async (id: number, status: string) => {
        const res = await api.patch<ApiResponse<FactoryProductItem>>(
            `/manager/products/${id}/status`,
            { status }
        );
        return res.data;
    },

    // Quản lý biến thể (Items / Mils) của sản phẩm
    getProductMils: async (productId: number) => {
        const res = await api.get<ApiResponse<FactoryProductVariantItem[]>>(
            `/manager/productMils/${productId}`
        );
        return res.data;
    },
    createProductMil: async (productId: number, data: Partial<FactoryProductMil>) => {
        const res = await api.post<ApiResponse<FactoryProductMil>>(
            `/manager/products/${productId}/mils`,
            data
        );
        return res.data;
    },
    updateFactoryProduct: async (productId: number, milId: number, data: Partial<FactoryProductVariantItem>) => {
        const res = await api.put<ApiResponse<FactoryProductVariantItem>>(
            `/manager/products/${productId}/mils/${milId}`,
            data
        );
        return res.data;
    },
    deleteProductMil: async (milId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(
            `/manager/products/${milId}/mils`
        );
        return res.data;
    },
    toggleStatusProductMil: async (productId: number, milId: number, isActive: boolean) => {
        const res = await api.patch<ApiResponse<FactoryProductVariantItem>>(
            `/manager/products/${productId}/mils/${milId}/status`,
            { isActive }
        );
        return res.data;
    },
    getProductImages: async (productId: number) => {
        const res = await api.get<HalProductImages>(
            `/v1/product-image/search/byProductId?productId=${productId}`
        );
        return res.data;
    },
    updateThumbnail: async (id: number, productId: number) => {
        const res = await api.patch<void>(
            `/manager/product-images/${id}/thumbnail`, {
            productId
        }
        );
        return res.data;
    },
    deleteThumbnail: async (id: number) => {
        const res = await api.delete<void>(
            `/manager/product-images/${id}/thumbnail`
        );
        return res.data;
    },
    updateProductMil: async (milId: number, data: FactoryProductMil) => {
        const res = await api.patch<void>(
            `/manager/product-mil/${milId}/mil`,
            data
        );
        return res.data;
    },
    changeStatusProductMils: async (milId: number) => {
        const res = await api.patch<void>(
            `/manager/product-mil/${milId}/mil`
        );
        return res.data;
    },
    getProductEdit: async (id: number) => {
        const res = await api.get<ApiResponse<FactoryProductEditRes>>(
            `/manager/products/${id}`
        );
        return res.data;
    },
    changeStatusOfProduct: async (id: number, status: ProductStatus) => {
        const res = await api.patch<void>(
            `/manager/products/${id}/status`, { status }
        );
        return res.data;
    },

    // Quản lý đơn hàng xưởng
    getOrders: async (params?: {
        page?: number;
        size?: number;
        search?: string;
        status?: OrderStatus;
        sortBy?: string;
        sortDir?: string;
    }) => {
        const res = await api.get<ApiResponse<AdminOrderPageResult>>(
            `/manager/orders`,
            { params }
        );
        return res.data;
    },
    getOrderStats: async () => {
        const res = await api.get<ApiResponse<AdminOrderStats>>(
            `/manager/orders/stats`
        );
        return res.data;
    },
    getOrderDetail: async (id: number) => {
        const res = await api.get<ApiResponse<AdminOrderDetail>>(
            `/manager/orders/${id}`
        );
        return res.data;
    },
    updateOrderStatus: async (
        id: number,
        data: { status: OrderStatus; note?: string; cancelReason?: string }
    ) => {
        const res = await api.patch<ApiResponse<AdminOrderDetail>>(
            `/manager/orders/${id}/status`,
            data
        );
        return res.data;
    },
    deleteOrder: async (id: number) => {
        const res = await api.delete<ApiResponse<void>>(
            `/manager/orders/${id}`
        );
        return res.data;
    },
    getStaffs: async () => {
        const res = await api.get<ApiResponse<FactoryStaffItem[]>>(`/manager/staffs`);
        return res.data;
    },
    createStaff: async (data: FactoryStaffCreateRequest) => {
        const res = await api.post<ApiResponse<FactoryStaffItem>>(`/manager/staffs`, data);
        return res.data;
    },
    updateStaff: async (id: number, data: FactoryStaffUpdateRequest) => {
        const res = await api.put<ApiResponse<FactoryStaffItem>>(`/manager/staffs/${id}`, data);
        return res.data;
    },
    deleteStaff: async (id: number) => {
        const res = await api.delete<ApiResponse<void>>(`/manager/staffs/${id}`);
        return res.data;
    },
};

export interface FactoryStaffItem {
    id: number;
    fullname: string;
    email: string;
    phone: string | null;
    factoryRole: "OWNER" | "STAFF";
    factoryPosition: string;
    status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "BANNED";
    joinedAt: string;
    avatar: string;
}

export interface FactoryStaffCreateRequest {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    factoryPosition?: string;
    status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}

export interface FactoryStaffUpdateRequest {
    fullname?: string;
    phone?: string;
    factoryPosition?: string;
    status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "BANNED";
}

export interface HalProductImages {
    _embedded: {
        productImages: ProductImage[];   // đổi key cho đúng với console.log bên dưới
    };
}