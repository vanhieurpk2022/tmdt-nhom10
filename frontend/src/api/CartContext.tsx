import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cartService, type CartResponse } from "./CartService";
import { useAuth } from "./AuthContext";

interface CartSummary {
    totalItems: number;
    total: number;
}

type CartNoticeType = "success" | "error";

interface CartNotice {
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

const emptySummary: CartSummary = {
    totalItems: 0,
    total: 0,
};

const CartContext = createContext<CartContextType | null>(null);

function toCartSummary(cart: CartResponse): CartSummary {
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    const total = cart.items.reduce((sum, item) => {
        const fallbackLineTotal = (item.price ?? item.basePrice ?? 0) * item.quantity;
        return sum + (item.lineTotal ?? fallbackLineTotal);
    }, 0);

    return {
        totalItems,
        total,
    };
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, loading: isAuthLoading } = useAuth();
    const [summary, setSummary] = useState<CartSummary>(emptySummary);
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState<CartNotice | null>(null);

    const applyCart = useCallback((cart: CartResponse) => {
        setSummary(toCartSummary(cart));
    }, []);

    const refreshCart = useCallback(async () => {
        if (!user) {
            setSummary(emptySummary);
            return;
        }

        try {
            setIsLoading(true);
            applyCart(await cartService.getCart());
        } catch (error) {
            console.error(error);
            setSummary(emptySummary);
        } finally {
            setIsLoading(false);
        }
    }, [applyCart, user]);

    const showCartNotice = useCallback((message: string, type: CartNoticeType = "success") => {
        setNotice({
            id: Date.now(),
            type,
            message,
        });
    }, []);

    const clearCartNotice = useCallback(() => {
        setNotice(null);
    }, []);

    useEffect(() => {
        if (isAuthLoading) return;
        refreshCart();
    }, [isAuthLoading, refreshCart]);

    useEffect(() => {
        if (!notice) return;

        const timeoutId = window.setTimeout(() => {
            setNotice(null);
        }, 3500);

        return () => window.clearTimeout(timeoutId);
    }, [notice]);

    return (
        <CartContext.Provider
            value={{
                summary,
                isLoading,
                notice,
                applyCart,
                refreshCart,
                showCartNotice,
                clearCartNotice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart phải được sử dụng bên trong CartProvider");
    }

    return context;
}
