import api from "./api";
import type { BuyNowSelection } from "./CheckoutSelection";

export interface ShippingFeeRequest {
    addressId: number;
    cartItemIds?: number[];
    buyNow?: BuyNowSelection;
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
