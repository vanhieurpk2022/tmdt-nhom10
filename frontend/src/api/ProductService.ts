import api from "./api";

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
    avatarUrl?: string | null;
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

export interface ProductMilItem {
    id: number;
    mil: number;
    price: number | null;
    basePrice: number | null;
    stockQuantity: number;
    isActive: boolean;
}

export interface ReviewItem {
    id: number;
    rating: number;
    comment: string;
    reviewerName: string;
    createdAt: string;
}

export interface ProductDetail {
    id: number;
    name: string;
    description: string;
    categoryName: string | null;
    factoryName: string | null;
    factoryAddress: string | null;
    avgRating: number;
    totalSold: number;
    reviewCount: number;
    totalStock: number;
    stockStatus: "Còn hàng" | "Sắp hết" | "Hết hàng";
    imageUrls: string[];
    variants: ProductMilItem[];
    reviews: ReviewItem[];
}


interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// Dịch vụ gọi API sản phẩm từ Backend

export const productService = {
    /** Lấy dữ liệu danh mục và nhà xưởng cho bộ lọc sidebar */
    getFilterMeta: async (): Promise<FilterMeta> => {
        const res = await api.get<ApiResponse<FilterMeta>>("/products/filter-meta");
        return res.data.data;
    },

    /** Lọc danh sách sản phẩm có phân trang theo tiêu chí */
    filterProducts: async (params: ProductFilterParams): Promise<ProductPage> => {
        const res = await api.get<ApiResponse<ProductPage>>("/products/filter", {
            params: {
                ...params,
            },
            // Tuỳ chỉnh cấu hình chuỗi truy vấn tham số URL
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

    /** Lấy danh sách sản phẩm mới nhất hiển thị trang chủ */
    getNewestProducts: async (limit = 4): Promise<ProductCard[]> => {
        const res = await api.get<ApiResponse<ProductCard[]>>("/products/newest", {
            params: { limit },
        });
        return res.data.data;
    },

    /** Lấy danh sách sản phẩm bán chạy nhất */
    getBestSellerProducts: async (limit = 4): Promise<ProductCard[]> => {
        const res = await api.get<ApiResponse<ProductCard[]>>("/products/best-sellers", {
            params: { limit },
        });
        return res.data.data;
    },

    /** Lấy thông tin chi tiết một sản phẩm theo ID */
    getProductDetail: async (id: number | string): Promise<ProductDetail> => {
        const res = await api.get<ApiResponse<ProductDetail>>(`/products/${id}`);
        return res.data.data;
    },
};


