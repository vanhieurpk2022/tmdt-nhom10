import { createContext, useContext } from "react";
import { type CartResponse } from "./CartService";


export interface CartSummary {
    totalItems: number;
    total: number;
}

export type CartNoticeType = "success" | "error";

export interface CartNotice {
    id: number;
    type: CartNoticeType;
    message: string;
}

interface CartContextType {
    summary: CartSummary;
    isLoading: boolean;
    notice: CartNotice | null;
    applyCart: (cart: CartResponse) => void;
    refreshCart: () => Promise<void>;
    showCartNotice: (message: string, type?: CartNoticeType) => void;
    clearCartNotice: () => void;
}

export const emptySummary: CartSummary = {
    totalItems: 0,
    total: 0,
};

export const CartContext = createContext<CartContextType | null>(null);

export function toCartSummary(cart: CartResponse): CartSummary {
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    const total = cart.items.reduce((sum, item) => {
        const fallbackLineTotal = (item.price ?? 0) * item.quantity;
        return sum + (item.lineTotal ?? fallbackLineTotal);
    }, 0);

    return {
        totalItems,
        total,
    };
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart phải được sử dụng bên trong CartProvider");
    }

    return context;
}
