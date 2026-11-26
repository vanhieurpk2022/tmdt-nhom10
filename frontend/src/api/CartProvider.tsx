import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cartService, type CartResponse } from "./CartService";
import { useAuth } from "./AuthContext";
import { type CartSummary, type CartNoticeType, type CartNotice, emptySummary, CartContext, toCartSummary } from "./CartContext";

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
