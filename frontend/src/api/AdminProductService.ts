import api from "./api";
import type { ApiResponse } from "./api";
import type { ProductType } from "../enums/ProductType";
import type { ProductStatus } from "../enums/ProductStatus";
import type { AdminProductDetail } from "../components/admin/product/AdminProductDetailModal";

export interface AdminProductListItem {
    id: number;
    code: string;
    name: string;
    description: string;
    categoryId?: number;
    categoryName: string;
    productType: ProductType;
    status: ProductStatus;
    thumbnailUrl: string;
    price: number;
    maxPrice?: number;
    totalStock: number;
    totalSold: number;
    views: number;
    rating: number;
    reviewCount: number;
    variantCount: number;
    factoryId?: number;
    factoryName: string;
    factoryAddress?: string;
    factoryPhone?: string;
    factoryRepresentative?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AdminProductPageResult {
    content: AdminProductListItem[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}

export interface AdminProductStats {
    totalProducts: number;
    activeCount: number;
    outOfStockCount: number;
    inactiveCount: number;
    customCount: number;
    normalCount: number;
    totalWorkshops: number;
}

export const AdminProductService = {
    /**
     * Lấy danh sách sản phẩm toàn sàn cho Admin (có phân trang, tìm kiếm và lọc)
     */
    getProducts: async (
        page: number = 0,
        size: number = 10,
        search?: string,
        factoryId?: number | string,
        categoryId?: number | string,
        productType?: ProductType | string,
        status?: ProductStatus | string,
        sortBy: string = "createdAt",
        sortDir: "asc" | "desc" = "desc"
    ): Promise<AdminProductPageResult> => {
        const params: Record<string, any> = { page, size, sortBy, sortDir };

        if (search && search.trim()) params.search = search.trim();
        if (factoryId && factoryId !== "ALL") params.factoryId = factoryId;
        if (categoryId && categoryId !== "ALL") params.categoryId = categoryId;
        if (productType && productType !== "ALL") params.productType = productType;
        if (status && status !== "ALL") params.status = status;

        const res = await api.get<ApiResponse<AdminProductPageResult>>("/admin/products", { params });
        return res.data.data;
    },

    /**
     * Lấy số liệu thống kê tổng hợp (Metrics)
     */
    getProductStats: async (): Promise<AdminProductStats> => {
        const res = await api.get<ApiResponse<AdminProductStats>>("/admin/products/stats");
        return res.data.data;
    },

    /**
     * Lấy thông tin chi tiết của 1 sản phẩm kèm dữ liệu xưởng, biến thể & công thức hương
     */
    getProductDetail: async (id: number): Promise<AdminProductDetail> => {
        const res = await api.get<ApiResponse<AdminProductDetail>>(`/admin/products/${id}`);
        return res.data.data;
    },

    /**
     * Cập nhật trạng thái sản phẩm (ACTIVE, INACTIVE, OUT_OF_STOCK, ARCHIVED)
     */
    updateProductStatus: async (id: number, status: ProductStatus): Promise<AdminProductDetail> => {
        const res = await api.patch<ApiResponse<AdminProductDetail>>(`/admin/products/${id}/status`, { status });
        return res.data.data;
    },

    /**
     * Xóa / Lưu trữ sản phẩm
     */
    deleteProduct: async (id: number): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/admin/products/${id}`);
    },
};

