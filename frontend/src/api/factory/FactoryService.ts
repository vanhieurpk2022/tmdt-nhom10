import type { FactoryOrderDashBoard } from "../../dto/factory/FactoryDashBoard";
import type { FactoryProductCreateRequest, FactoryProductItem, FactoryProductMil, FactoryProductResponse, FactoryProductVariantItem } from "../../dto/factory/FactoryProductRes";
import type { ProductImage } from "../../models/ProductImage";
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
    createProduct: async (data: Partial<FactoryProductCreateRequest>) => {
        const res = await api.post<ApiResponse<FactoryProductCreateRequest>>(
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
        const res = await api.get<void>(
            `/manager/product-mil/${milId}/mil`
        );
        return res.data;
    },

};

export interface HalProductImages {
    _embedded: {
        productImages: ProductImage[];   // đổi key cho đúng với console.log bên dưới
    };
}