import api from "./api";

// Types

export interface ProductCard {
    id: number;
    name: string;
    description: string;
    factoryName: string;
    price: number;
    basePrice: number;
    discountRate: number;
    avgRating: number;
    totalSold: number;
    stockStatus: "Còn hàng" | "Sắp hết" | "Hết hàng";
    thumbnailUrl: string | null;
}

export interface ProductPage {
    products: ProductCard[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
}

export interface CategoryMeta {
    id: number;
    name: string;
    productCount: number;
}

export interface FactoryMeta {
    id: number;
    name: string;
    productCount: number;
}

export interface FilterMeta {
    categories: CategoryMeta[];
    factories: FactoryMeta[];
}

export interface ProductFilterParams {
    categoryIds?: number[];
    factoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: string;
    page?: number;
    size?: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// Service

export const productService = {
    /** Lấy metadata sidebar: categories + factories */
    getFilterMeta: async (): Promise<FilterMeta> => {
        const res = await api.get<ApiResponse<FilterMeta>>("/products/filter-meta");
        return res.data.data;
    },

    /** Lọc sản phẩm với phân trang */
    filterProducts: async (params: ProductFilterParams): Promise<ProductPage> => {
        const res = await api.get<ApiResponse<ProductPage>>("/products/filter", {
            params: {
                ...params,
                // Axios tự serialize array: categoryIds=1&categoryIds=2
            },
            // Serializer cho array params
            paramsSerializer: (p) => {
                const searchParams = new URLSearchParams();
                Object.entries(p).forEach(([key, val]) => {
                    if (val === undefined || val === null) return;
                    if (Array.isArray(val)) {
                        val.forEach((v) => searchParams.append(key, String(v)));
                    } else {
                        searchParams.append(key, String(val));
                    }
                });
                return searchParams.toString();
            },
        });
        return res.data.data;
    },

    getNewestProducts: async (limit = 4): Promise<ProductCard[]> => {
        const res = await api.get<ApiResponse<ProductCard[]>>("/products/newest", {
            params: { limit },
        });
        return res.data.data;
    },

    getBestSellerProducts: async (limit = 4): Promise<ProductCard[]> => {
        const res = await api.get<ApiResponse<ProductCard[]>>("/products/best-sellers", {
            params: { limit },
        });
        return res.data.data;
    },
};
