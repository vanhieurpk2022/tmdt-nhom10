import api from "./api";

export interface CartItemResponse {
    id: number;
    productId: number;
    productMilId?: number | null;
    mil?: number | null;
    productName: string;
    description: string | null;
    factoryName: string | null;
    thumbnailUrl: string | null;
    price: number | null;
    basePrice: number | null;
    quantity: number;
    stockQuantity: number;
    stockStatus: string;
    lineTotal: number;
}

export interface CartResponse {
    cartId: number;
    items: CartItemResponse[];
    totalItems: number;
    subtotal: number;
    discountTotal: number;
    total: number;
}

export interface AddCartItemRequest {
    productId: number;
    productMilId?: number;
    quantity?: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export const cartService = {
    getCart: async (): Promise<CartResponse> => {
        const res = await api.get<ApiResponse<CartResponse>>("/cart");
        return res.data.data;
    },

    addItem: async (request: AddCartItemRequest): Promise<CartResponse> => {
        const res = await api.post<ApiResponse<CartResponse>>("/cart/items", request);
        return res.data.data;
    },

    updateItem: async (itemId: number, request: UpdateCartItemRequest): Promise<CartResponse> => {
        const res = await api.put<ApiResponse<CartResponse>>(`/cart/items/${itemId}`, request);
        return res.data.data;
    },

    removeItem: async (itemId: number): Promise<CartResponse> => {
        const res = await api.delete<ApiResponse<CartResponse>>(`/cart/items/${itemId}`);
        return res.data.data;
    },

    clearCart: async (): Promise<CartResponse> => {
        const res = await api.delete<ApiResponse<CartResponse>>("/cart/items");
        return res.data.data;
    },
};
