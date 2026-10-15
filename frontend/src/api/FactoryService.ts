import api, { type ApiResponse } from "./api";

export interface FactoryItem {
    id: number;
    name: string;
    address: string;
    description: string;
    factoryStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;
    productCount: number;
    avatarUrl: string | null;
    bannerUrl: string | null;
    galleryImages: string[];
    minPrice?: number | null;
    maxPrice?: number | null;
}

export const FactoryApiService = {
    /** Lấy danh sách tất cả xưởng đối tác */
    getAllFactories: async (): Promise<FactoryItem[]> => {
        const res = await api.get<ApiResponse<FactoryItem[]>>("/factories");
        return res.data.data;
    },

    /** Lấy chi tiết một xưởng theo ID */
    getFactoryDetail: async (id: number | string): Promise<FactoryItem> => {
        const res = await api.get<ApiResponse<FactoryItem>>(`/factories/${id}`);
        return res.data.data;
    },
};
