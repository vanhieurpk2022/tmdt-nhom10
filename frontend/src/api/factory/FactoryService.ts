import type { FactoryOrderDashBoard } from "../../dto/factory/FactoryDashBoard";
import type { FactoryProductItem, FactoryProductResponse, FactoryProductVariantItem } from "../../dto/factory/FactoryProductRes";
import api, { type ApiResponse } from "../api";

export const FactoryServiceManager = {
    getUserDashBoard: async () => {
        const res = await api.get<ApiResponse<FactoryOrderDashBoard[]>>(
            `/manager/dashboard/user`
        );
        return res.data;
    },
    getProducts: async () => {
        const res = await api.get<ApiResponse<FactoryProductResponse>>(
            `/manager/products`
        );
        return res.data;
    },
    createProduct: async (data: Partial<FactoryProductItem>) => {
        const res = await api.post<ApiResponse<FactoryProductItem>>(
            `/manager/products`,
            data
        );
        return res.data;
    },
    updateProduct: async (id: number, data: Partial<FactoryProductItem>) => {
        const res = await api.put<ApiResponse<FactoryProductItem>>(
            `/manager/products/${id}`,
            data
        );
        return res.data;
    },
    deleteProduct: async (id: number) => {
        const res = await api.delete<ApiResponse<boolean>>(
            `/manager/products/${id}`
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

    // Quản lý biến thể (Items / Mils) của sản phẩm
    getProductMils: async (productId: number) => {
        const res = await api.get<ApiResponse<FactoryProductVariantItem[]>>(
            `/manager/products/${productId}/mils`
        );
        return res.data;
    },
    createProductMil: async (productId: number, data: Partial<FactoryProductVariantItem>) => {
        const res = await api.post<ApiResponse<FactoryProductVariantItem>>(
            `/manager/products/${productId}/mils`,
            data
        );
        return res.data;
    },
    updateProductMil: async (productId: number, milId: number, data: Partial<FactoryProductVariantItem>) => {
        const res = await api.put<ApiResponse<FactoryProductVariantItem>>(
            `/manager/products/${productId}/mils/${milId}`,
            data
        );
        return res.data;
    },
    deleteProductMil: async (productId: number, milId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(
            `/manager/products/${productId}/mils/${milId}`
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
};