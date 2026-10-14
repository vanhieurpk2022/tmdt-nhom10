import api from "./api";

export interface ShippingFeeRequest {
    addressId: number;
    cartItemIds: number[];
}

export interface ShippingFeeResponse {
    addressId: number;
    shippingFee: number;
    provider: string;
    message: string;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export const shippingService = {
    calculateFee: async (request: ShippingFeeRequest): Promise<ShippingFeeResponse> => {
        const res = await api.post<ApiResponse<ShippingFeeResponse>>("/shipping/fee", request);
        return res.data.data;
    },
};
