import api from "./api";

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
interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface RegisterFactoryRequest {
    name: string;
    address: string;
    accountHolder: string;
    accountNumber: string;
    shopPhone: string;
    fullNameRepre: string;
    identity: string;
    typeFactory: number;
    licenseUrl?: string;
    cosmeticLicenseUrl?: string;
    tccsDocUrl?: string;
    originInvoiceUrl?: string;
    brandAuthorizationUrl?: string;
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

    /** Đăng kí người bán dạng có Multifile*/
    regsiterFactory: async (
        request: RegisterFactoryRequest
    ): Promise<ApiResponse<void>> => {
        const res = await api.post<ApiResponse<void>>(
            "/factories/register",
            request
        );

        return res.data;
    },

};
